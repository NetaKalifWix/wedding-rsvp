import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import Database from "./dbUtilsPostgresNeon";
import { FilterOptions, Guest, GuestIdentifier, User } from "./types"; // Assuming you have a types file for the Guest type
import { Request, Response } from "express-serve-static-core"; // Import from express-serve-static-core
import axios from "axios";

dotenv.config();

const app = express();
app.use(express.json() as any);
app.use(cors() as any);
app.use(express.urlencoded({ extended: true }) as any);

let db: Database;

const initialData = {
  key: process.env.SMS_4_FREE_KEY,
  user: process.env.SMS_4_FREE_USER,
  sender: process.env.SMS_4_FREE_SENDER,
  pass: process.env.SMS_4_FREE_PASS,
};
const url = "https://api.sms4free.co.il/ApiSMS/v2/SendSMS";

const sendSMS = (msg: string, guestsNumber: string) => {
  const data = {
    ...initialData,
    recipient: guestsNumber,
    msg,
  };
  axios
    .post(url, data)
    .then((response) => {
      console.log("SMS sent:", response.data);
    })
    .catch((error) => {
      console.error(
        "Error sending SMS:",
        error.response?.data || error.message
      );
    });
};

app.post("/sms", async (req: Request, res: Response) => {
  try {
    const { msg, sender } = req.body;

    if (!sender || !msg) {
      return res.status(400).send("<Response></Response>");
    }
    const guestsList = await db.getAllGuests();

    const guestSender = guestsList.find(
      (guest: Guest) => guest.phone === sender
    );

    if (!guestSender) {
      console.log(`Phone number not found in guest list: ${sender}`);
      return res.send("<Response></Response>");
    }

    const rsvpNumber = parseInt(msg, 10);

    if (isNaN(rsvpNumber) || rsvpNumber < 0 || rsvpNumber > 15) {
      console.log(`Invalid RSVP number: ${msg}. Must be between 0 and 15.`);
      sendSMS("תשובתך אינה תקינה. אנא שלח מספר בין 0 ל-15.", sender);

      return res.send("<Response></Response>");
    }

    console.log(`Received RSVP from ${guestSender.name}: ${msg}`);

    try {
      await db.updateRSVP(guestSender.name, guestSender.phone, rsvpNumber);
      console.log("Guest list updated and RSVP saved");
    } catch (dbError) {
      console.error("Failed to update RSVP in the database:", dbError);
      sendSMS("שגיאה בעדכון תשובתך במערכת. אנא נסה שוב מאוחר יותר.", sender);
      return res.send("<Response></Response>");
    }
    sendSMS(
      `תודה ${guestSender.invitationName} על עדכון תשובתך! מספר האורחים: ${rsvpNumber}`,
      sender
    );

    res.send("<Response></Response>");
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

app.post("/sendMessage", async (req: Request, res: Response) => {
  try {
    const {
      userID,
      filterOptions,
      message,
    }: {
      userID: User["userID"];
      filterOptions: FilterOptions[];
      message: string;
    } = req.body;
    const guestsList = await db.getGuests(userID);

    let filteredGuests = guestsList;
    if (!filterOptions.includes("all")) {
      filteredGuests = guestsList.filter((guest: Guest) => {
        if (filterOptions.includes("pending")) return !guest.RSVP;
        if (filterOptions.includes("declined"))
          return guest.RSVP && guest.RSVP === 0;
        return guest.RSVP && guest.RSVP > 0;
      });
    }

    await Promise.all(
      filteredGuests.map(async (guest: Guest) => {
        try {
          const personalizedMessage = message.replace("***", guest.name);
          sendSMS(personalizedMessage, guest.phone);
          console.log(`Message sent to ${guest.name} (${guest.phone})`);
        } catch (twilioError) {
          console.error(
            `Failed to send message to ${guest.name} (${guest.phone})`,
            twilioError
          );
        }
      })
    );

    res.status(200).send("Messages sent");
  } catch (error) {
    console.error("Error sending messages:", error);
    res.status(500).send("Failed to send messages");
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
    await db.deleteGuest(userID, guest);
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
