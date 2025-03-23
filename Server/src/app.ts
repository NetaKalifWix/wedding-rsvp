import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import twilio from "twilio";
import Database from "./dbUtilsPostgresNeon";
import { FilterOptions, Guest, User } from "./types"; // Assuming you have a types file for the Guest type
import { Request, Response } from "express-serve-static-core"; // Import from express-serve-static-core

dotenv.config();

const app = express();
app.use(express.json() as any);
app.use(cors() as any);
app.use(express.urlencoded({ extended: true }) as any);

let db: Database;

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID as string,
  process.env.TWILIO_AUTH_TOKEN as string
);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER as string;

app.post("/sms", async (req: Request, res: Response) => {
  try {
    const { Body, From } = req.body;

    if (!From || !Body) {
      return res.status(400).send("<Response></Response>");
    }
    const guestsList = await db.getAllGuests();

    const sender = guestsList.find((guest: Guest) => guest.phone === From);

    if (!sender) {
      console.log(`Phone number not found in guest list: ${From}`);
      return res.send("<Response></Response>");
    }

    const rsvpNumber = parseInt(Body, 10);

    if (isNaN(rsvpNumber) || rsvpNumber < 0 || rsvpNumber > 15) {
      console.log(`Invalid RSVP number: ${Body}. Must be between 0 and 15.`);
      await twilioClient.messages.create({
        body: "תשובתך אינה תקינה. אנא שלח מספר בין 0 ל-15.",
        from: twilioPhoneNumber,
        to: From,
      });

      return res.send("<Response></Response>");
    }

    console.log(`Received RSVP from ${sender.name}: ${Body}`);

    try {
      await db.updateRSVP(sender.name, sender.phone, rsvpNumber);
      console.log("Guest list updated and RSVP saved");
    } catch (dbError) {
      console.error("Failed to update RSVP in the database:", dbError);
      await twilioClient.messages.create({
        body: "שגיאה בעדכון תשובתך במערכת. אנא נסה שוב מאוחר יותר.",
        from: twilioPhoneNumber,
        to: From,
      });
      return res.send("<Response></Response>");
    }

    await twilioClient.messages.create({
      body: `\nתודה על תשובתך! מספר האורחים שעודכן: ${rsvpNumber}\nבמידה ותרצו לעדכן, שלחו מספר חדש.`,
      from: twilioPhoneNumber,
      to: sender.phone,
    });

    res.send("<Response></Response>");
  } catch (error) {
    console.error("Error processing SMS:", error);
    res.status(500).send("Server error");
  }
});

app.post("/updateRsvp", async (req: Request, res: Response) => {
  try {
    const { userID, guest }: { userID: string; guest: Guest } = req.body;
    await db.updateRSVP(guest.name, guest.phone, guest.RSVP);
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
      filterOption,
      message,
    }: {
      userID: User["userID"];
      filterOption: FilterOptions;
      message: string;
    } = req.body;
    const guestsList = await db.getGuests(userID);

    const filteredGuests = guestsList.filter((guest: Guest) => {
      if (filterOption === "all") return true;
      if (filterOption === "noRsvp") return !guest.RSVP;
      return guest.RSVP && guest.RSVP > 0;
    });

    await Promise.all(
      filteredGuests.map(async (guest: Guest) => {
        try {
          const personalizedMessage = message.replace("***", guest.name);
          await twilioClient.messages.create({
            body: personalizedMessage,
            from: twilioPhoneNumber,
            to: guest.phone,
          });
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

app.get("/rsvp", async (req: Request, res: Response) => {
  try {
    const { userID }: { userID: User["userID"] } = req.body;
    const guestsList = await db.getGuests(userID);
    const guestsWithRSVP = guestsList.filter(
      (guest: Guest) => guest.RSVP !== null
    );
    res.json(guestsWithRSVP);
  } catch (error) {
    console.error("Error retrieving guests with RSVP:", error);
    res.status(500).send("Error retrieving guests with RSVP");
  }
});

app.get("/guestsList", async (req: Request, res: Response) => {
  try {
    const { userID }: { userID: User["userID"] } = req.body;
    const guestsList = await db.getGuests(userID);
    res.json(guestsList);
  } catch (error) {
    console.error("Error retrieving guest list:", error);
    res.status(500).send("Error retrieving guest list");
  }
});

app.patch("/add", async (req: Request, res: Response) => {
  try {
    const {
      guestsToAdd,
      userID,
    }: { guestsToAdd: Guest[]; userID: User["userID"] } = req.body;

    if (!Array.isArray(guestsToAdd)) {
      return res.status(400).send("Invalid input: expected an array of guests");
    }

    guestsToAdd.forEach((guest) => {
      if (!guest.invitationName) {
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

// Delete a guest
app.delete("/deleteGuest", async (req: Request, res: Response) => {
  try {
    const { userID, guest }: { userID: User["userID"]; guest: Guest } =
      req.body;
    await db.deleteGuest(userID, guest);
    const guestsList = await db.getGuests(userID);
    res.status(200).send(guestsList);
  } catch (error) {
    console.error("Error deleting guest:", error);
    res.status(500).send("Failed to delete guest");
  }
});

app.listen(3002, async () => {
  try {
    db = await Database.connect();
    console.log("Connected to database");
  } catch (error) {
    console.error("Server startup error:", error);
  }
});
