import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import Database from "./dbUtilsPostgresNeon";
import {
  FilterOptions,
  Guest,
  GuestIdentifier,
  User,
  WeddingDetails,
} from "./types";
import { Request, Response } from "express-serve-static-core";
import multer from "multer";
import {
  handleButtonReply,
  sendWhatsAppMessage,
  uploadImage,
  handleTextResponse,
  logMessage,
} from "./utils";
import { messagesMap } from "./messages";
import axios from "axios";
import { getAccessToken } from "./whatsappTokenManager";

const upload = multer({ storage: multer.memoryStorage() });
dotenv.config();

const app = express();
app.use(express.json() as any);
app.use(cors() as any);
app.use(express.urlencoded({ extended: true }) as any);

let db: Database;

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// Track last execution time to prevent duplicate sends within the same minute
let lastExecutionMinute = "";

app.get("/sms", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post("/sms", async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const value = data?.entry?.[0]?.changes?.[0]?.value;

    if (!value?.messages || !Array.isArray(value.messages)) {
      return res.sendStatus(200); // Acknowledge it to avoid retries
    }

    const message = value.messages[0];
    const sender = "+" + message.from;
    const guestsList = await db.getAllGuests();
    const guestSender = guestsList.find(
      (guest: Guest) => guest.phone === sender
    );

    if (!guestSender) {
      console.log(`Phone number not found in guest list: ${sender}`);
      return res.sendStatus(200);
    }
    let msg;
    if (message.type === "button") {
      msg = message.button?.payload || message.button?.text || "";
      await logMessage(
        guestSender.userID,
        `🔘 SMS button reply received from ${guestSender.name} (${guestSender.phone}): ${msg}`
      );
      await handleButtonReply(msg, guestSender).catch((error) => {
        console.error("Error processing SMS:", error);
        return res.status(500).send(error.message);
      });
    } else if (message.type === "text") {
      msg = message.text.body;
      await logMessage(
        guestSender.userID,
        `📥 SMS text message received from ${guestSender.name} (${guestSender.phone}): ${msg}`
      );
      await handleTextResponse(msg, guestSender).catch((error) => {
        console.error("Error processing SMS:", error);
        return res.status(500).send(error.message);
      });
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing SMS:", error);
    return res.status(500).send("Server error");
  }
});

app.post("/updateRsvp", async (req: Request, res: Response) => {
  try {
    const { userID, guest }: { userID: string; guest: Guest } = req.body;
    await db.updateRSVP(guest.name, guest.phone, guest.RSVP, userID);
    await logMessage(
      userID,
      `📠 RSVP updated for guest: ${guest.name} - RSVP: ${guest.RSVP}`
    );
    const guestsList = await db.getGuests(userID);
    res.status(200).send(guestsList);
  } catch (error) {
    console.error("Error updating RSVP:", error);
    return res.status(500).send("Failed to update RSVP");
  }
});

app.post("/guestsList", async (req: Request, res: Response) => {
  try {
    const { userID }: { userID: User["userID"] } = req.body;
    const guestsList = await db.getGuests(userID);
    res.status(200).json(guestsList);
  } catch (error) {
    console.error("Error retrieving guest list:", error);
    return res.status(500).send("Error retrieving guest list");
  }
});

app.patch("/addGuests", async (req: Request, res: Response) => {
  const {
    guestsToAdd,
    userID,
  }: { guestsToAdd: Guest[]; userID: User["userID"] } = req.body;
  try {
    if (!Array.isArray(guestsToAdd)) {
      return res.status(400).send("Invalid input: expected an array of guests");
    }

    await db.addMultipleGuests(userID, guestsToAdd);
    const guestsList = await db.getGuests(userID);
    await await logMessage(
      userID,
      `👥 Added ${guestsToAdd.length} guests. Total guests: ${guestsList.length}`
    );
    res.status(200).send(guestsList);
  } catch (error) {
    await logMessage(userID, `❌ Error adding guests: ${error.message}`);
    return res.status(500).send("Failed to add guests");
  }
});

app.patch("/addUser", async (req: Request, res: Response) => {
  try {
    console.log("Adding user");
    const { newUser }: { newUser: User } = req.body;
    await db.addUser(newUser);
    const guestsList = await db.getGuests(newUser.userID);
    await logMessage(
      newUser.userID,
      `🆕 User account created: ${newUser.name} (${newUser.email}). User ID: ${newUser.userID}`
    );
    res.status(200).send(guestsList);
  } catch (error) {
    console.error("Error adding guests:", error);
    return res.status(500).send("Failed to add guests");
  }
});

app.delete("/deleteUser", async (req: Request, res: Response) => {
  const { userID }: { userID: User["userID"] } = req.body;
  try {
    await db.deleteUser(userID);
    await await logMessage(userID, "🗑️ User account deleted");
    res.status(200).send("User deleted");
  } catch (error) {
    await logMessage(userID, `❌ Error deleting user: ${error.message}`);
    return res.status(500).send("Failed to delete user");
  }
});

app.delete("/deleteAllGuests", async (req: Request, res: Response) => {
  const { userID }: { userID: User["userID"] } = req.body;
  try {
    await db.deleteAllGuests(userID);
    const guestsList = await db.getGuests(userID);
    await logMessage(userID, "🧹 All guests deleted from account");
    res.status(200).send(guestsList);
  } catch (error) {
    await logMessage(userID, `❌ Error erasing guest list: ${error.message}`);
    return res.status(500).send("Failed to reset database");
  }
});

app.delete("/deleteGuest", async (req: Request, res: Response) => {
  const {
    userID,
    guest,
  }: {
    userID: User["userID"];
    guest: GuestIdentifier;
  } = req.body;
  try {
    await db.deleteGuest(guest, userID);
    await logMessage(userID, `👋 Guest deleted: ${guest.name}`);
    const guestsList = await db.getGuests(userID);
    res.status(200).send(guestsList);
  } catch (error) {
    await logMessage(userID, `❌ Error deleting guest: ${error.message}`);
    return res.status(500).send("Failed to delete guest");
  }
});

app.post(
  "/saveWeddingInfo",
  upload.single("imageFile"),
  async (req: Request, res: Response) => {
    const userID = req.body.userID;
    try {
      const weddingInfo = JSON.parse(req.body.weddingInfo);
      const file = (req as any).file;

      // If a new file is uploaded, process it and update fileID
      if (file) {
        try {
          const fileID = await uploadImage(file);
          weddingInfo.fileID = fileID;
        } catch (error) {
          console.error("Error uploading image:", error);
          return res.status(500).send("Failed to upload image");
        }
      } else {
        // If no new file is uploaded, get the existing fileID from the database
        const existingInfo = await db.getWeddingInfo(userID);
        if (existingInfo && existingInfo.fileID) {
          weddingInfo.fileID = existingInfo.fileID;
        }
      }

      await db.saveWeddingInfo(userID, weddingInfo);
      await logMessage(
        userID,
        `💒 Wedding information saved: ${JSON.stringify(weddingInfo)}`
      );

      res.status(200).send("Wedding information saved successfully");
    } catch (error) {
      await logMessage(
        userID,
        `❌ Error saving wedding information: ${error.message}`
      );
      return res.status(500).send("Failed to save wedding information");
    }
  }
);

app.get("/getWeddingInfo/:userID", async (req: Request, res: Response) => {
  try {
    const userID = req.params.userID;
    const weddingInfo = await db.getWeddingInfo(userID);
    res.status(200).json(weddingInfo);
  } catch (error) {
    console.error("Error retrieving wedding information:", error);
    return res.status(500).send("Failed to retrieve wedding information");
  }
});

app.patch("/updateGuestsGroups", async (req: Request, res: Response) => {
  const { guests, userID }: { guests: Guest[]; userID: User["userID"] } =
    req.body;
  try {
    await db.updateGuestsGroups(userID, guests);
    await logMessage(userID, `🔗 Guest groups updated`);
    const updatedGuestsList = await db.getGuests(userID);
    res.status(200).json(updatedGuestsList);
  } catch (error) {
    await logMessage(
      userID,
      `❌ Error updating guest groups: ${error.message}`
    );
    return res.status(500).send("Failed to update guest groups");
  }
});

app.post("/sendMessage", async (req: Request, res: Response) => {
  try {
    const { userID, options } = req.body;
    const messageType = options?.messageType || "rsvp";
    const customText = options?.customText;

    let guests = await db.getGuestsWithUserID(userID);

    // Filter by message group if specified
    if (options?.messageGroup) {
      guests = guests.filter(
        (guest) => guest.messageGroup === Number(options.messageGroup)
      );
    }

    // Filter by RSVP status for reminder messages
    if (messageType === "reminder") {
      guests = guests.filter(
        (guest) => guest.RSVP === null || guest.RSVP === undefined
      );
    }

    // Filter for confirmed guests only (wedding reminder)
    if (messageType === "weddingReminder") {
      guests = guests.filter((guest) => guest.RSVP && guest.RSVP > 0);
    }

    if (guests.length > 250) {
      await logMessage(
        userID,
        `❌ Too many guests to send messages to: ${guests.length}. no more than 250 guests can be sent messages to at 24 hours`
      );
      return res.status(400).send("Too many guests to send messages to");
    }

    // Validate free text message
    if (
      messageType === "freeText" &&
      (!customText || customText.trim() === "")
    ) {
      await logMessage(userID, `❌ Custom text message cannot be empty`);
      return res.status(400).send("Custom text message cannot be empty");
    }

    const messageTypeLabel =
      messageType === "rsvp"
        ? "RSVP invitation"
        : messageType === "reminder"
        ? "reminder"
        : messageType === "weddingReminder"
        ? "wedding reminder"
        : "custom text";

    await logMessage(
      userID,
      `📨 Sending ${messageTypeLabel} messages to ${guests.length} guests${
        options?.messageGroup ? ` in group ${options.messageGroup}` : ""
      }`
    );

    const weddingInfo = await db.getWeddingInfo(userID);

    let messagePromises;

    if (messageType === "freeText") {
      // Send custom text message
      messagePromises = guests.map((guest) =>
        sendWhatsAppMessage(guest, customText)
      );
    } else if (messageType === "reminder") {
      // Send reminder template message
      messagePromises = guests.map((guest) =>
        sendWhatsAppMessage(guest, undefined, {
          type: "wedding_rsvp_reminder",
          info: weddingInfo,
        })
      );
    } else if (messageType === "weddingReminder") {
      // Send wedding reminder based on configured reminder day
      let reminderType;
      const hasGiftLink =
        weddingInfo.gift_link && weddingInfo.gift_link.trim() !== "";

      if (weddingInfo.reminder_day === "wedding_day") {
        // Wedding day - check if gift link is empty
        reminderType = hasGiftLink
          ? "wedding_day_reminder"
          : "wedding_reminders_no_gift_same_day";
      } else {
        // Day before wedding - check if gift link is empty
        reminderType = hasGiftLink
          ? "day_before_wedding_reminder"
          : "wedding_reminders_no_gift";
      }
      messagePromises = guests.map((guest) =>
        sendWhatsAppMessage(guest, undefined, {
          type: reminderType,
          info: weddingInfo,
        })
      );
    } else {
      // Send RSVP invitation (default)
      messagePromises = guests.map((guest) =>
        sendWhatsAppMessage(guest, undefined, {
          type: "wedding_rsvp_action",
          info: weddingInfo,
        })
      );
    }

    try {
      await Promise.all(messagePromises);
      await logMessage(
        userID,
        `🎯 ${messageTypeLabel} messages sent successfully to ${
          guests.length
        } guests${
          options?.messageGroup ? ` in group ${options.messageGroup}` : ""
        }`
      );
      return res.status(200).send("Messages sent successfully");
    } catch (error) {
      return res.status(500).send(error.message);
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

app.get("/getImage/:userID", async (req: Request, res: Response) => {
  const userID = req.params.userID;
  const weddingInfo = await db.getWeddingInfo(userID);
  const ACCESS_TOKEN = await getAccessToken();

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${weddingInfo.fileID}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
        params: {
          access_token: ACCESS_TOKEN,
        },
      }
    );

    const imageUrl = response.data.url;

    const imageResponse = await axios.get(imageUrl, {
      responseType: "stream",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });

    res.setHeader("Content-Type", imageResponse.headers["content-type"]);
    imageResponse.data.pipe(res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch image" });
  }
});

app.post("/sendWarUpdater", async (req: Request, res: Response) => {
  try {
    const { userID } = req.body;
    const guests = await db.getGuests(userID);
    const confirmedGuests = guests.filter((g) => g.RSVP && g.RSVP > 0);
    const messagePromises = confirmedGuests.map((guest) =>
      sendWhatsAppMessage(guest, undefined, {
        type: "war_updater",
      })
    );
    try {
      await Promise.all(messagePromises);
      return res.status(200).send("Messages sent successfully");
    } catch (error) {
      return res.status(500).send(error.message);
    }
  } catch (error) {
    console.error("Error sending war updater:", error);
  }
});

app.get("/logs/:userID", async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    if (!userID) {
      return res.status(400).send("UserID is required");
    }
    const logs = await db.getClientLogs(userID);
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error retrieving logs:", error);
    return res.status(500).send("Failed to retrieve logs");
  }
});

// Admin endpoints
app.post("/checkAdmin", async (req: Request, res: Response) => {
  try {
    const { userID }: { userID: string } = req.body;
    const adminUserID = process.env.ADMIN_USER_ID;
    const isAdmin = userID === adminUserID;
    res.status(200).json({ isAdmin });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return res.status(500).send("Failed to check admin status");
  }
});

app.post("/getUsers", async (req: Request, res: Response) => {
  try {
    const { userID }: { userID: string } = req.body;
    const adminUserID = process.env.ADMIN_USER_ID;

    // Only allow admin to access this endpoint
    if (userID !== adminUserID) {
      return res.status(403).send("Access denied. Admin privileges required.");
    }

    const users = await db.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);
    return res.status(500).send("Failed to retrieve users");
  }
});

// Helper function to check if current time matches the configured time (within the same hour and minute)
// Times are in Israel timezone
function isTimeToSend(
  configuredTime: string | undefined,
  defaultTime: string
): boolean {
  // Get current time in Israel timezone (Asia/Jerusalem)
  const now = new Date();
  const israelTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })
  );
  const currentHour = israelTime.getHours();
  const currentMinute = israelTime.getMinutes();

  // Use configured time or default
  const timeToUse = configuredTime || defaultTime;
  const [targetHour, targetMinute] = timeToUse.split(":").map(Number);

  // Check if current time matches target time (within the same hour and minute)
  return currentHour === targetHour && currentMinute === targetMinute;
}

// Function to send scheduled messages
async function sendScheduledMessages() {
  try {
    // Prevent duplicate executions within the same minute
    const now = new Date();
    const israelTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })
    );
    const currentMinute = `${israelTime.getHours()}:${israelTime.getMinutes()}`;

    if (lastExecutionMinute === currentMinute) {
      console.log("⏭️ Already executed in this minute, skipping...");
      return;
    }

    lastExecutionMinute = currentMinute;
    console.log("⚙️ Starting scheduled messages check...");
    const weddings = await db.getWeddingsForMessaging();
    console.log(`📝 Found ${weddings.length} weddings to process`);

    for (const { userID, info } of weddings) {
      const guests = await db.getGuestsWithUserID(userID);
      let confirmedGuests = guests.filter((g) => g.RSVP && g.RSVP > 0);
      const today = new Date().toLocaleDateString("he-IL");
      const weddingDate = new Date(info.wedding_date).toLocaleDateString(
        "he-IL"
      );
      const dayBeforeWedding = new Date(info.wedding_date);
      dayBeforeWedding.setDate(dayBeforeWedding.getDate() - 1);
      const dayBeforeWeddingDate = new Date(
        dayBeforeWedding
      ).toLocaleDateString("he-IL");
      const dayAfterWedding = new Date(info.wedding_date);
      dayAfterWedding.setDate(dayAfterWedding.getDate() + 1);
      const dayAfterWeddingDate = new Date(dayAfterWedding).toLocaleDateString(
        "he-IL"
      );

      const reminderDay = info.reminder_day || "day_before";
      const reminderTime = info.reminder_time || "10:00";

      // Send day before wedding reminder if that's the chosen option
      if (
        reminderDay === "day_before" &&
        today === dayBeforeWeddingDate &&
        isTimeToSend(reminderTime, "10:00")
      ) {
        await logMessage(
          userID,
          `🔄 Processing day before wedding reminder for: ${info.bride_name} & ${info.groom_name} at ${reminderTime}`
        );

        let guestsToSend = confirmedGuests;
        if (confirmedGuests.length > 250) {
          guestsToSend = confirmedGuests.filter((g) => g.messageGroup === 1);
          if (guestsToSend.length > 250) {
            await logMessage(
              userID,
              `🚩 Too many guests to send messages to: ${guestsToSend.length}. Sending only 250 guests`
            );
            guestsToSend = guestsToSend.slice(0, 250);
          }
        }

        await logMessage(
          userID,
          `🌅 Sending day before wedding messages to ${guestsToSend.length} guests`
        );

        // Check if gift link is empty to determine which template to use
        const templateType =
          !info.gift_link || info.gift_link.trim() === ""
            ? "wedding_reminders_no_gift"
            : "day_before_wedding_reminder";

        const dayBeforeWeddingPromises = guestsToSend.map((guest) => {
          return sendWhatsAppMessage(guest, undefined, {
            type: templateType,
            info,
          });
        });

        try {
          await Promise.all(dayBeforeWeddingPromises);
          await logMessage(
            userID,
            `🎊 Day-before-wedding messages sent successfully to ${guestsToSend.length} guests`
          );
        } catch (error) {
          await logMessage(
            userID,
            `🚩 Error sending day-before-wedding messages: ${error.message}`
          );
        }
      }

      // Send wedding day reminder if that's the chosen option
      if (
        reminderDay === "wedding_day" &&
        today === weddingDate &&
        isTimeToSend(reminderTime, "09:00")
      ) {
        await logMessage(
          userID,
          `🔄 Processing wedding day reminder for: ${info.bride_name} & ${info.groom_name} at ${reminderTime}`
        );

        let guestsToSend = confirmedGuests;
        if (confirmedGuests.length > 250) {
          guestsToSend = confirmedGuests.filter((g) => g.messageGroup === 2);
          if (guestsToSend.length > 250) {
            await logMessage(
              userID,
              `🚩 Too many guests to send messages to: ${guestsToSend.length}. Sending only 250 guests`
            );
            guestsToSend = guestsToSend.slice(0, 250);
          }
        }

        await logMessage(
          userID,
          `💐 Sending wedding day messages to ${guestsToSend.length} guests`
        );

        // Check if gift link is empty to determine which template to use
        const templateType =
          !info.gift_link || info.gift_link.trim() === ""
            ? "wedding_reminders_no_gift_same_day"
            : "wedding_day_reminder";

        const weddingDayPromises = guestsToSend.map((guest) => {
          return sendWhatsAppMessage(guest, undefined, {
            type: templateType,
            info,
          });
        });

        try {
          await Promise.all(weddingDayPromises);
          await logMessage(
            userID,
            `💍 Wedding day messages sent successfully to ${guestsToSend.length} guests`
          );
        } catch (error) {
          console.error("Error sending day of the wedding reminder:", error);
          await logMessage(
            userID,
            `❌ Error sending wedding day messages: ${error.message}`
          );
        }
      }

      // Send thank you message on day after wedding at 10:00 AM (default time)
      if (today === dayAfterWeddingDate && isTimeToSend("10:00", "10:00")) {
        await logMessage(
          userID,
          `🔄 Processing thank you messages for: ${info.bride_name} & ${info.groom_name}`
        );

        let guestsToSend = confirmedGuests;
        if (confirmedGuests.length > 250) {
          guestsToSend = confirmedGuests.filter(
            (g) => g.RSVP && g.RSVP > 0 && g.messageGroup === 1
          );
          if (guestsToSend.length > 250) {
            await logMessage(
              userID,
              `🚩 Too many guests to send messages to: ${guestsToSend.length}. Sending only 250 guests`
            );
            guestsToSend = guestsToSend.slice(0, 250);
          }
        }

        await logMessage(
          userID,
          `🎁 Sending thank you messages to ${guestsToSend.length} guests`
        );

        const thankYouMessage = messagesMap.thankYou(
          info.thank_you_message,
          info.bride_name,
          info.groom_name
        );
        const thankYouPromises = guestsToSend.map((guest) => {
          return sendWhatsAppMessage(guest, thankYouMessage);
        });

        try {
          await Promise.all(thankYouPromises);
          await logMessage(
            userID,
            `🙏 Thank you messages sent successfully to ${guestsToSend.length} guests`
          );
        } catch (error) {
          console.error("Error sending thank you message:", error);
          await logMessage(
            userID,
            `❌ Error sending thank you messages: ${error.message}`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error sending scheduled messages:", error);
  }
}

// Function to clean up old logs
async function cleanupOldLogs() {
  try {
    console.log("🧹 Starting log cleanup...");
    const deletedCount = await db.cleanupOldLogs();
    console.log(`🗑️ Deleted ${deletedCount} old log entries`);
  } catch (error) {
    console.error("Error cleaning up logs:", error);
  }
}

// Run the scheduler every minute to check for scheduled messages
setInterval(() => {
  sendScheduledMessages();

  // Clean up old logs once a day at midnight
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    cleanupOldLogs();
  }
}, 60000); // Check every minute

app.listen(8080, async () => {
  try {
    db = await Database.connect();
    console.log("Connected to database");
  } catch (error) {
    console.error("Server startup error:", error);
  }
});
