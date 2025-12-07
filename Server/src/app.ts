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
  TemplateName,
} from "./types";
import { Request, Response } from "express-serve-static-core";
import multer from "multer";
import {
  handleButtonReply,
  sendWhatsAppMessage,
  uploadImage,
  handleTextResponse,
  logMessage,
  batchLogMessageResults,
  MessageResult,
} from "./utils";
import { getDateFormat, getWeddingDateStrings } from "./dateUtils";
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
const MAX_GUESTS_PER_MESSAGE_BATCH = 250;
const ISRAEL_TIMEZONE = "Asia/Jerusalem";
const THANK_YOU_MESSAGE_TIME = "10:00";

// Track last execution time to prevent duplicate sends within the same minute
let lastExecutionMinute = "";

// ==================== Helper Functions ====================

const getIsraelTime = (): Date => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: ISRAEL_TIMEZONE }));
};

const isTimeToSend = (timeToUse: string): boolean => {
  const israelTime = getIsraelTime();
  const currentHour = israelTime.getHours();
  const currentMinute = israelTime.getMinutes();
  const [targetHour, targetMinute] = timeToUse.split(":").map(Number);
  return currentHour === targetHour && currentMinute === targetMinute;
};

const getTemplateName = (
  messageType: string,
  hasGiftLink: boolean,
  isWeddingDay: boolean
): TemplateName => {
  if (messageType === "weddingReminder") {
    if (isWeddingDay) {
      return hasGiftLink
        ? "wedding_day_reminder"
        : "wedding_reminders_no_gift_same_day";
    }
    return hasGiftLink
      ? "day_before_wedding_reminder"
      : "wedding_reminders_no_gift";
  }
  return messageType as TemplateName;
};

const limitGuestsByMaxGuestsNumber = (guests: Guest[]): Guest[] => {
  if (guests.length <= MAX_GUESTS_PER_MESSAGE_BATCH) {
    return guests;
  }
  return guests.slice(0, MAX_GUESTS_PER_MESSAGE_BATCH);
};

const filterAndLimitGuests = (
  guests: Guest[],
  options: {
    messageGroup?: number;
    rsvpStatus?: FilterOptions;
  }
): Guest[] => {
  let filtered = guests;

  if (options.messageGroup) {
    filtered = filtered.filter(
      (guest) => guest.messageGroup === options.messageGroup
    );
  }

  if (options.rsvpStatus === "pending") {
    filtered = filtered.filter(
      (guest) => guest.RSVP === null || guest.RSVP === undefined
    );
  } else if (options.rsvpStatus === "approved") {
    filtered = filtered.filter((guest) => guest.RSVP && guest.RSVP > 0);
  } else if (options.rsvpStatus === "declined") {
    filtered = filtered.filter((guest) => guest.RSVP === 0);
  }

  return limitGuestsByMaxGuestsNumber(filtered);
};

const handleError = async (
  res: Response,
  error: any,
  message: string,
  userID?: string
): Promise<Response> => {
  console.error(message, error);
  if (userID) {
    await logMessage(userID, `❌ ${message}: ${error.message}`);
  }
  return res.status(500).send(message);
};

const checkAdminAccess = (userID: string): boolean => {
  return userID === process.env.ADMIN_USER_ID;
};

// ==================== Routes ====================

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
    await logMessage(
      userID,
      `👥 Added ${guestsToAdd.length} guests. Total guests: ${guestsList.length}`
    );
    res.status(200).send(guestsList);
  } catch (error) {
    return handleError(res, error, "Failed to add guests", userID);
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
    return handleError(res, error, "Failed to add user");
  }
});

app.delete("/deleteUser", async (req: Request, res: Response) => {
  const { userID }: { userID: User["userID"] } = req.body;
  try {
    await db.deleteAllGuests(userID);
    await db.deleteUser(userID);
    await logMessage(undefined, "🗑️ User account deleted");
    res.status(200).send("User deleted");
  } catch (error) {
    return handleError(res, error, "Failed to delete user", userID);
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
    return handleError(res, error, "Failed to reset database", userID);
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
    return handleError(res, error, "Failed to delete guest", userID);
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
        const fileID = await uploadImage(file);
        weddingInfo.fileID = fileID;
      } else {
        // If no new file is uploaded, preserve the existing fileID
        const existingInfo = await db.getWeddingInfo(userID);
        if (existingInfo?.fileID) {
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
      return handleError(
        res,
        error,
        "Failed to save wedding information",
        userID
      );
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
    return handleError(res, error, "Failed to update guest groups", userID);
  }
});

app.post("/sendMessage", async (req: Request, res: Response) => {
  try {
    const { userID, options } = req.body;
    const messageType = options?.messageType || "rsvp";
    const customText = options?.customText;

    // Validate free text message
    if (
      messageType === "freeText" &&
      (!customText || customText.trim() === "")
    ) {
      await logMessage(userID, `❌ Custom text message cannot be empty`);
      return res.status(400).send("Custom text message cannot be empty");
    }

    const allGuests = await db.getGuestsWithUserID(userID);
    const guests = filterAndLimitGuests(allGuests, {
      messageGroup: options?.messageGroup
        ? Number(options.messageGroup)
        : undefined,
      rsvpStatus:
        messageType === "reminder"
          ? "pending"
          : messageType === "weddingReminder"
          ? "approved"
          : undefined,
    });

    if (guests.length === 0) {
      await logMessage(userID, `❌ No guests match the selected criteria`);
      return res.status(400).send("No guests match the selected criteria");
    }

    // Check if we had to limit the guests
    if (guests.length === MAX_GUESTS_PER_MESSAGE_BATCH) {
      await logMessage(
        userID,
        `⚠️ Guest list limited to ${MAX_GUESTS_PER_MESSAGE_BATCH} guests (WhatsApp limit)`
      );
    }

    const messageTypeLabel =
      messageType === "rsvp"
        ? "RSVP invitation"
        : messageType === "reminder"
        ? "reminder"
        : messageType === "weddingReminder"
        ? "wedding reminder"
        : "custom text";

    const groupSuffix = options?.messageGroup
      ? ` in group ${options.messageGroup}`
      : "";

    await logMessage(
      userID,
      `📨 Sending ${messageTypeLabel} messages to ${guests.length} guests${groupSuffix}`
    );

    const weddingInfo = await db.getWeddingInfo(userID);
    const messagePromises = buildMessagePromises(
      guests,
      messageType,
      customText,
      weddingInfo
    );

    const messageResults = await sendMessagesAndLog(
      messagePromises,
      userID,
      "🎯",
      `${messageTypeLabel} messages${groupSuffix}`
    );

    return res.status(200).send(messageResults);
  } catch (error) {
    console.error("Error sending messages:", error);
    return res.status(500).send(error.message);
  }
});

const sendMessagesAndLog = async (
  promises: Promise<MessageResult>[],
  userID: string,
  successEmoji: string,
  messageLabel: string,
  preMessageLogs: string[] = []
): Promise<{
  success: number;
  fail: number;
  failGuestsList: Pick<MessageResult, "guestName" | "logMessage">[];
}> => {
  const results = await Promise.all(promises);

  const successCount = results.filter((r) => r.success).length;
  const fail = results.filter((r) => !r.success);
  const failCount = fail.length;
  const failGuestsList = fail.map((r) => ({
    logMessage: r.logMessage,
    guestName: r.guestName,
  }));

  const summaryMessage =
    failCount === 0
      ? `${successEmoji} ${messageLabel} sent successfully to ${successCount} guests`
      : `${successEmoji} ${messageLabel}: \n ✅ ${successCount} sent, ❌ ${failCount} failed`;

  await batchLogMessageResults([
    ...preMessageLogs.map((msg) => ({
      success: true,
      userID,
      guestName: "",
      logMessage: msg,
    })),
    ...results,
    { success: true, userID, guestName: "", logMessage: summaryMessage },
  ]);
  return { success: successCount, fail: failCount, failGuestsList };
};

const buildMessagePromises = (
  guests: Guest[],
  messageType: string,
  customText: string,
  weddingInfo: WeddingDetails
): Promise<MessageResult>[] => {
  if (messageType === "freeText") {
    return guests.map((guest) =>
      sendWhatsAppMessage(guest, { freeText: customText })
    );
  }

  if (messageType === "reminder") {
    return guests.map((guest) =>
      sendWhatsAppMessage(guest, {
        template: {
          name: "wedding_rsvp_reminder",
          info: weddingInfo,
        },
      })
    );
  }

  if (messageType === "weddingReminder") {
    const hasGiftLink =
      weddingInfo.gift_link && weddingInfo.gift_link.trim() !== "";
    const isWeddingDay = weddingInfo.reminder_day === "wedding_day";
    const templateName = getTemplateName(
      messageType,
      hasGiftLink,
      isWeddingDay
    );

    return guests.map((guest) =>
      sendWhatsAppMessage(guest, {
        template: {
          name: templateName,
          info: weddingInfo,
        },
      })
    );
  }

  // Default: RSVP invitation
  return guests.map((guest) =>
    sendWhatsAppMessage(guest, {
      template: {
        name: "wedding_rsvp_action",
        info: weddingInfo,
      },
    })
  );
};

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

// ==================== Admin Endpoints ====================

app.post("/checkAdmin", async (req: Request, res: Response) => {
  try {
    const { userID }: { userID: string } = req.body;
    const isAdmin = checkAdminAccess(userID);
    res.status(200).json({ isAdmin });
  } catch (error) {
    return handleError(res, error, "Failed to check admin status");
  }
});

app.post("/getUsers", async (req: Request, res: Response) => {
  try {
    const { userID }: { userID: string } = req.body;

    if (!checkAdminAccess(userID)) {
      return res.status(403).send("Access denied. Admin privileges required.");
    }

    const users = await db.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    return handleError(res, error, "Failed to retrieve users");
  }
});

// ==================== Scheduled Message Functions ====================

const sendWeddingReminders = async (
  userID: string,
  guests: Guest[],
  weddingInfo: WeddingDetails,
  isWeddingDay: boolean,
  messageGroup?: number
): Promise<void> => {
  const guestsToSend = filterAndLimitGuests(guests, {
    messageGroup,
    rsvpStatus: "approved",
  });

  const dayType = isWeddingDay ? "wedding day" : "day before wedding";

  if (guestsToSend.length === 0) {
    await logMessage(userID, `⚠️ No guests to send ${dayType} messages to`);
    return;
  }

  const preMessageLogs: string[] = [];

  if (guestsToSend.length === MAX_GUESTS_PER_MESSAGE_BATCH) {
    preMessageLogs.push(
      `⚠️ Limited to ${MAX_GUESTS_PER_MESSAGE_BATCH} guests (WhatsApp limit)`
    );
  }

  preMessageLogs.push(
    `💐 Sending ${dayType} messages to ${guestsToSend.length} guests`
  );

  const hasGiftLink = weddingInfo.gift_link?.trim() !== "";
  const templateName = getTemplateName(
    "weddingReminder",
    hasGiftLink,
    isWeddingDay
  );

  const promises = guestsToSend.map((guest) =>
    sendWhatsAppMessage(guest, {
      template: { name: templateName, info: weddingInfo },
    })
  );

  await sendMessagesAndLog(
    promises,
    userID,
    "💍",
    `${dayType} messages`,
    preMessageLogs
  );
};

const sendThankYouMessages = async (
  userID: string,
  guests: Guest[],
  weddingInfo: WeddingDetails
): Promise<void> => {
  const guestsToSend = filterAndLimitGuests(guests, {
    rsvpStatus: "approved",
  });

  if (guestsToSend.length === 0) {
    await logMessage(userID, `⚠️ No guests to send thank you messages to`);
    return;
  }

  const preMessageLogs: string[] = [];

  if (guestsToSend.length === MAX_GUESTS_PER_MESSAGE_BATCH) {
    preMessageLogs.push(
      `⚠️ Limited to ${MAX_GUESTS_PER_MESSAGE_BATCH} guests (WhatsApp limit)`
    );
  }

  preMessageLogs.push(
    `🎁 Sending thank you messages to ${guestsToSend.length} guests`
  );

  const templateName =
    weddingInfo.thank_you_message?.trim() !== ""
      ? "custom_thank_you_message"
      : "thank_you_message";

  const promises = guestsToSend.map((guest) =>
    sendWhatsAppMessage(guest, {
      template: { name: templateName, info: weddingInfo },
    })
  );

  await sendMessagesAndLog(
    promises,
    userID,
    "🙏",
    "thank you messages",
    preMessageLogs
  );
};

const sendScheduledMessages = async () => {
  try {
    // Prevent duplicate executions within the same minute
    const israelTime = getIsraelTime();
    const currentMinute = `${israelTime.getHours()}:${israelTime.getMinutes()}`;

    if (lastExecutionMinute === currentMinute) {
      console.log("⏭️ Already executed in this minute, skipping...");
      return;
    }

    lastExecutionMinute = currentMinute;
    console.log("⚙️ Starting scheduled messages check...");

    const weddings = await db.getWeddingsForMessaging();
    if (weddings.length === 0) {
      return;
    }
    console.log(`📝 Found ${weddings.length} weddings to process`);

    for (const { userID, info } of weddings) {
      const guests = await db.getGuestsWithUserID(userID);

      const today = getDateFormat(new Date());

      const { weddingDateStr, dayBeforeWeddingStr, dayAfterWeddingStr } =
        getWeddingDateStrings(info.wedding_date);
      const reminderDay = info.reminder_day || "day_before";
      const reminderTime = info.reminder_time || "09:00";

      // Send day before wedding reminder
      if (
        reminderDay === "day_before" &&
        today === dayBeforeWeddingStr &&
        isTimeToSend(reminderTime)
      ) {
        await logMessage(
          userID,
          `🔄 Processing day before wedding reminder for: ${info.bride_name} & ${info.groom_name} at ${reminderTime}`
        );
        await sendWeddingReminders(userID, guests, info, false);
      }

      // Send wedding day reminder
      if (
        reminderDay === "wedding_day" &&
        today === weddingDateStr &&
        isTimeToSend(reminderTime)
      ) {
        await logMessage(
          userID,
          `🔄 Processing wedding day reminder for: ${info.bride_name} & ${info.groom_name} at ${reminderTime}`
        );
        await sendWeddingReminders(userID, guests, info, true);
      }

      // Send thank you messages the day after the wedding
      if (
        today === dayAfterWeddingStr &&
        isTimeToSend(THANK_YOU_MESSAGE_TIME)
      ) {
        await logMessage(
          userID,
          `🔄 Processing thank you messages for: ${info.bride_name} & ${info.groom_name}`
        );
        await sendThankYouMessages(userID, guests, info);
      }
    }
  } catch (error) {
    console.error("Error sending scheduled messages:", error);
  }
};

const cleanupOldLogs = async () => {
  try {
    console.log("🧹 Starting log cleanup...");
    const deletedCount = await db.cleanupOldLogs();
    console.log(`🗑️ Deleted ${deletedCount} old log entries`);
  } catch (error) {
    console.error("Error cleaning up logs:", error);
  }
};

setInterval(() => {
  sendScheduledMessages();
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    cleanupOldLogs();
  }
}, 60000);

app.listen(8080, async () => {
  try {
    db = await Database.connect();
    console.log("Connected to database");
    sendScheduledMessages();
  } catch (error) {
    console.error("Server startup error:", error);
  }
});
