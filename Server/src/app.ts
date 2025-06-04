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
  filterGuests,
  handleButtonReply,
  sendWhatsAppMessage,
  uploadImage,
  handleTextResponse,
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
      console.log("📥 received button reply from", sender, "with message", msg);
      await handleButtonReply(msg, guestSender, db.updateRSVP.bind(db));
    } else if (message.type === "text") {
      msg = message.text.body;
      console.log("📥 received text from", sender, "with message", msg);
      await handleTextResponse(
        msg,
        guestSender,
        db.deleteGuest.bind(db),
        db.updateRSVP.bind(db)
      );
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing SMS:", error);
    res.status(500).send("Server error");
  }
});

app.post("/updateRsvp", async (req: Request, res: Response) => {
  try {
    const { userID, guest }: { userID: string; guest: Guest } = req.body;
    await db.updateRSVP(guest.name, guest.phone, guest.RSVP, userID);
    console.log("RSVP updated");
    const guestsList = await db.getGuests(userID);
    res.status(200).send(guestsList);
  } catch (error) {
    console.error("Error updating RSVP:", error);
    res.status(500).send("Failed to update RSVP");
  }
});

app.post("/guestsList", async (req: Request, res: Response) => {
  try {
    const { userID }: { userID: User["userID"] } = req.body;
    const guestsList = await db.getGuests(userID);
    res.status(200).json(guestsList);
  } catch (error) {
    console.error("Error retrieving guest list:", error);
    res.status(500).send("Error retrieving guest list");
  }
});

app.patch("/addGuests", async (req: Request, res: Response) => {
  try {
    const {
      guestsToAdd,
      userID,
    }: { guestsToAdd: Guest[]; userID: User["userID"] } = req.body;

    if (!Array.isArray(guestsToAdd)) {
      return res.status(400).send("Invalid input: expected an array of guests");
    }

    await db.addMultipleGuests(userID, guestsToAdd);
    const guestsList = await db.getGuests(userID);
    console.log(
      `Added ${guestsToAdd.length} guests. Total: ${guestsList.length}`
    );
    res.status(200).send(guestsList);
  } catch (error) {
    console.error("Error adding guests:", error);
    res.status(500).send("Failed to add guests");
  }
});

app.patch("/addUser", async (req: Request, res: Response) => {
  try {
    console.log("Adding user");
    const { newUser }: { newUser: User } = req.body;
    await db.addUser(newUser);
    const guestsList = await db.getGuests(newUser.userID);
    console.log(`Added User ${newUser.name}. user id: ${newUser.userID}.`);
    res.status(200).send(guestsList);
  } catch (error) {
    console.error("Error adding guests:", error);
    res.status(500).send("Failed to add guests");
  }
});

app.delete("/deleteUser", async (req: Request, res: Response) => {
  try {
    const { userID }: { userID: User["userID"] } = req.body;
    await db.deleteUser(userID);
    console.log(`User ${userID} was deleted`);
    res.status(200).send("User deleted");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Failed to delete user");
  }
});

app.delete("/deleteAllGuests", async (req: Request, res: Response) => {
  try {
    const { userID }: { userID: User["userID"] } = req.body;
    await db.deleteAllGuests(userID);
    const guestsList = await db.getGuests(userID);
    console.log(`All guests of user ${userID} were deleted`);
    res.status(200).send(guestsList);
  } catch (error) {
    console.error("Error erasing guest list:", error);
    res.status(500).send("Failed to reset database");
  }
});

app.delete("/deleteGuest", async (req: Request, res: Response) => {
  try {
    const {
      userID,
      guest,
    }: {
      userID: User["userID"];
      guest: GuestIdentifier;
    } = req.body;
    await db.deleteGuest(guest, userID);
    const guestsList = await db.getGuests(userID);
    res.status(200).send(guestsList);
  } catch (error) {
    console.error("Error deleting guest:", error);
    res.status(500).send("Failed to delete guest");
  }
});

app.post(
  "/saveWeddingInfo",
  upload.single("imageFile"),
  async (req: Request, res: Response) => {
    try {
      const userID = req.body.userID;
      const weddingInfo = JSON.parse(req.body.weddingInfo);
      const file = (req as any).file;

      // If a new file is uploaded, process it and update fileID
      if (file) {
        try {
          const fileID = await uploadImage(file);
          weddingInfo.fileID = fileID;
        } catch (error) {
          console.error("Error uploading image:", error);
          res.status(500).send("Failed to upload image");
          return;
        }
      } else {
        // If no new file is uploaded, get the existing fileID from the database
        const existingInfo = await db.getWeddingInfo(userID);
        if (existingInfo && existingInfo.fileID) {
          weddingInfo.fileID = existingInfo.fileID;
        }
      }

      await db.saveWeddingInfo(userID, weddingInfo);
      console.log("Wedding information saved successfully", weddingInfo);

      res.status(200).send("Wedding information saved successfully");
    } catch (error) {
      console.error("Error saving wedding information:", error);
      res.status(500).send("Failed to save wedding information");
    }
  }
);

app.get("/getWeddingInfo/:userID", async (req: Request, res: Response) => {
  try {
    const userID = req.params.userID;
    const weddingInfo = await db.getWeddingInfo(userID);
    if (!weddingInfo) {
      res.status(404).send("Wedding information not found");
      return;
    }
    res.status(200).json(weddingInfo);
  } catch (error) {
    console.error("Error retrieving wedding information:", error);
    res.status(500).send("Failed to retrieve wedding information");
  }
});

app.patch("/updateGuestsGroups", async (req: Request, res: Response) => {
  try {
    const { guests, userID }: { guests: Guest[]; userID: User["userID"] } =
      req.body;

    await db.updateGuestsGroups(userID, guests);
    const updatedGuestsList = await db.getGuests(userID);
    res.status(200).json(updatedGuestsList);
  } catch (error) {
    console.error("Error updating guest groups:", error);
    res.status(500).send("Failed to update guest groups");
  }
});

app.post("/sendMessage", async (req: Request, res: Response) => {
  try {
    const { userID, options } = req.body;

    let guests = await db.getGuests(userID);

    if (options.messageGroup) {
      guests = guests.filter(
        (guest) => guest.messageGroup === Number(options.messageGroup)
      );
    }
    if (options.resendToPending) {
      guests = guests.filter((guest) => guest.RSVP === null);
    }

    console.log("sending message to", guests.length, "guests");

    const weddingInfo = await db.getWeddingInfo(userID);

    for (const guest of guests) {
      await sendWhatsAppMessage(guest.phone, undefined, {
        type: "wedding_rsvp_action",
        info: weddingInfo,
      });
    }

    res.status(200).send("Messages sent successfully");
  } catch (error) {
    console.error("Error sending messages:", error);
    res.status(500).send("Failed to send messages");
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
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

// Function to send scheduled messages
async function sendScheduledMessages() {
  try {
    console.log("🔄 Starting scheduled messages check...");
    const weddings = await db.getWeddingsForMessaging();
    console.log(`📋 Found ${weddings.length} weddings to process`);

    for (const { userID, info } of weddings) {
      console.log(`👰 Processing wedding for userID: ${info.bride_name}`);
      const guests = await db.getGuests(userID);
      const confirmedGuests = guests.filter((g) => g.RSVP && g.RSVP > 0);
      const today = new Date().toLocaleDateString("he-IL");
      console.log(`📅 Today's date: ${today}`);
      const weddingDate = new Date(info.wedding_date).toLocaleDateString(
        "he-IL"
      );
      const dayAfterWedding = new Date(info.wedding_date);
      dayAfterWedding.setDate(dayAfterWedding.getDate() + 1);
      const dayAfterWeddingDate = new Date(dayAfterWedding).toLocaleDateString(
        "he-IL"
      );
      console.log(
        `📊 Wedding info dates:\n Wedding: ${weddingDate}\n Day after wedding: ${dayAfterWeddingDate}`
      );
      // Send reminder message on wedding day morning
      if (today === weddingDate) {
        console.log(
          "Sending message on wedding day morning for",
          info.bride_name
        );
        for (const guest of confirmedGuests) {
          await sendWhatsAppMessage(guest.phone, undefined, {
            type: "wedding_day_reminder",
            info,
          });
        }
      }

      if (today === dayAfterWeddingDate) {
        console.log(
          "Sending message on day after wedding for",
          info.bride_name
        );
        const confirmedGuests = guests.filter((g) => g.RSVP && g.RSVP > 0);
        for (const guest of confirmedGuests) {
          const thankYouMessage = messagesMap.thankYou(
            guest.name,
            info.thank_you_message,
            info.bride_name,
            info.groom_name
          );
          await sendWhatsAppMessage(guest.phone, thankYouMessage);
        }
      }
    }
  } catch (error) {
    console.error("Error sending scheduled messages:", error);
  }
}
// Run the scheduler every day at 9:00 AM Israel time
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 6 && now.getMinutes() === 0) {
    sendScheduledMessages();
  }
}, 60000);

app.listen(8080, async () => {
  try {
    db = await Database.connect();
    console.log("Connected to database");
  } catch (error) {
    console.error("Server startup error:", error);
  }
});
