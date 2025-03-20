require("dotenv").config();
const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const Database = require("./dbUtils");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

let db, guestsList, filterGuestsOption, message;

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// listens for incoming SMS messages
app.post("/sms", async (req, res) => {
  try {
    const { Body, From } = req.body;

    const sender = guestsList.find((guest) => guest.Phone === From);

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

    console.log(`Received RSVP from ${sender.Name}: ${Body}`);

    try {
      await db.updateRSVP({
        Name: sender.Name,
        Phone: sender.Phone,
        RSVP: rsvpNumber,
      });
      guestsList = await db.get();
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
      to: sender.Phone,
    });

    res.send("<Response></Response>");
  } catch (error) {
    console.error("Error processing SMS:", error);
    res.status(500).send("Server error");
  }
});

app.post("/updateRsvp", async (req, res) => {
  try {
    const { Name, Phone, RSVP } = req.body;
    await db.updateRSVP({ Name, Phone, RSVP });
    console.log("RSVP updated");
    guestsList = await db.get();
    res.status(200).send(guestsList);
  } catch (error) {
    console.error("Error updating RSVP:", error);
    res.status(500).send("Failed to update RSVP");
  }
});

app.post("/sendMessage", async (req, res) => {
  try {
    const { filterOption, message } = req.body;

    const filteredGuests = guestsList.filter((guest) => {
      if (filterOption === "all") return true;
      if (filterOption === "noRsvp") return !guest.RSVP;
      return guest.RSVP > 0;
    });

    await Promise.all(
      filteredGuests.map(async (guest) => {
        try {
          const personalizedMessage = message.replace("***", guest.Name);
          await twilioClient.messages.create({
            body: personalizedMessage,
            from: twilioPhoneNumber,
            to: guest.Phone,
          });
          console.log(`Message sent to ${guest.Name} (${guest.Phone})`);
        } catch (twilioError) {
          console.error(
            `Failed to send message to ${guest.Name} (${guest.Phone})`,
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

// Get guests with RSVP
app.get("/rsvp", async (req, res) => {
  try {
    const guestsWithRSVP = guestsList.filter((guest) => guest.RSVP !== null);
    res.json(guestsWithRSVP);
  } catch (error) {
    console.error("Error retrieving guests with RSVP:", error);
    res.status(500).send("Error retrieving guests with RSVP");
  }
});

// Get all guests
app.get("/guestsList", async (req, res) => {
  try {
    guestsList = await db.get();
    res.json(guestsList);
  } catch (error) {
    console.error("Error retrieving guest list:", error);
    res.status(500).send("Error retrieving guest list");
  }
});

app.patch("/add", async (req, res) => {
  try {
    const guestsToAdd = req.body; // Expecting an array of guests

    if (!Array.isArray(guestsToAdd) || guestsToAdd.length === 0) {
      return res.status(400).send("Invalid input: expected an array of guests");
    }

    guestsToAdd.forEach((guest) => {
      if (!guest.InvitationName) {
        guest.InvitationName = guest.Name;
      }
    });

    await db.addMultiple(guestsToAdd);
    guestsList = await db.get();
    console.log(
      `Added ${guestsToAdd.length} guests. Total: ${guestsList.length}`
    );
    res.status(200).send(guestsList);
  } catch (error) {
    console.error("Error adding guests:", error);
    res.status(500).send("Failed to add guests");
  }
});

// Reset database
app.delete("/resetDatabase", async (req, res) => {
  try {
    await db.deleteAllData();
    guestsList = await db.get();
    console.log("Database reset");
    res.status(200).send(guestsList);
  } catch (error) {
    console.error("Error erasing guest list:", error);
    res.status(500).send("Failed to reset database");
  }
});

// Delete a guest
app.delete("/deleteGuest", async (req, res) => {
  try {
    await db.delete(req.body);
    guestsList = await db.get();
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
    guestsList = await db.get();
    console.log("Server started on port 3002");
  } catch (error) {
    console.error("Server startup error:", error);
  }
});
