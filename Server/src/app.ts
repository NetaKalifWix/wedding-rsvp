import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import Database from "./dbUtilsPostgresNeon";
import { FilterOptions, Guest, GuestIdentifier, User } from "./types"; // Assuming you have a types file for the Guest type
import { Request, Response } from "express-serve-static-core"; // Import from express-serve-static-core

import multer from "multer";

import {
  filterGuests,
  handleGuestNumberRSVP,
  handleButtonReply,
  sendWhatsAppMessage,
  uploadImage,
} from "./utils";
import { messagesMap } from "./messages";

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
      return res.send("sender in not a guest of any wedding");
    }

    let msg = "";

    if (message.type === "button") {
      msg = message.button?.payload || message.button?.text || "";
      await handleButtonReply(msg, guestSender, db.updateRSVP.bind(db));
    } else if (message.type === "text") {
      msg = message.text.body;
      if (msg === "טעות") {
        console.log(
          "received delete request from",
          sender,
          "its name is",
          guestSender.name
        );
        db.deleteGuest(guestSender);
        await sendWhatsAppMessage(messagesMap.mistake, guestSender.phone);
        res.sendStatus(200);
        return;
      }
      const parsedToIntMsg = parseInt(msg, 10);
      if (isNaN(parsedToIntMsg) || parsedToIntMsg < 0 || parsedToIntMsg > 10) {
        await sendWhatsAppMessage(
          messagesMap.unknownResponse,
          guestSender.phone
        );
        res.sendStatus(200);
        return;
      }
      await handleGuestNumberRSVP(
        parsedToIntMsg,
        guestSender,
        db.updateRSVP.bind(db)
      );
    } else {
      msg = "";
    }

    console.log("📥 message Received from", sender, "with message", msg);

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

app.post(
  "/sendMessage",
  upload.single("imageFile"),
  async (req: Request, res: Response) => {
    try {
      const {
        userID,
        filterOptions,
        messageType,
      }: {
        userID: User["userID"];
        filterOptions: FilterOptions[];
        message: string;
        messageType: "template" | "freeText";
      } = req.body;
      const data =
        messageType === "template"
          ? JSON.parse(req.body.templateData)
          : req.body.message;

      const file = (req as any).file;
      const guestsList = await db.getGuests(userID);
      const filteredGuests = filterGuests(guestsList, filterOptions);

      let imageId;
      try {
        if (file) {
          imageId = await uploadImage(file);
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }

      await Promise.all(
        filteredGuests.map(async (guest: Guest) => {
          try {
            console.log(`Sending message to ${guest.name}`);
            await sendWhatsAppMessage(
              data,
              guest.phone,
              messageType === "template",
              imageId
            );
          } catch (error) {
            console.error(
              `Failed to send message to ${guest.name} (${guest.phone})`,
              error
            );
          }
        })
      );

      res.status(200).send("Messages sent");
    } catch (error) {
      console.error("Error sending messages:", error);
      res.status(500).send("Failed to send messages");
    }
  }
);

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

    guestsToAdd.forEach((guest) => {
      if (!guest.invitationName || guest.invitationName === "") {
        guest.invitationName = guest.name;
      }
    });

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
app.get("/wakeUp", async (req: Request, res: Response) => {
  res.status(200).send("im awake");
});

app.listen(8080, async () => {
  try {
    db = await Database.connect();
    console.log("Connected to database");
  } catch (error) {
    console.error("Server startup error:", error);
  }
});
