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
  const { Body, From } = req.body;
  console.log(`Message received from: ${From}`);

  // Check if the Body is a number between 0 and 15
  const rsvpNumber = parseInt(Body, 10);

  if (isNaN(rsvpNumber) || rsvpNumber < 0 || rsvpNumber > 15) {
    console.log(
      `Invalid RSVP number: ${Body}. It must be a number between 0 and 15.`
    );
    twilioClient.messages
      .create({
        body: "תשובתך אינה תקינה. אנא שלח מספר בין 0 ל-15.",
        from: twilioPhoneNumber,
        to: From,
      })
      .then(() => {
        console.log(`Message sent to ${From} with error message.`);
      })
      .catch((err) => {
        console.error(`Failed to send message to ${From}`, err);
      });

    return res.send("<Response></Response>"); // Respond to Twilio to acknowledge the message
  }

  // Continue with the existing logic if the RSVP number is valid
  const sender = guestsList.find((guest) => guest.Phone === From);

  if (sender) {
    console.log(`Received RSVP from ${sender.Name}: ${Body}`);
    db.updateRSVP({
      name: sender.Name,
      phone: sender.Phone,
      rsvp: rsvpNumber,
    });
    guestsList = await db.get();
    console.log("Guest list updated and RSVP saved");

    twilioClient.messages
      .create({
        body:
          "\nתודה על תשובתך! מספר הארוחים שעודכן במערכת: " +
          rsvpNumber +
          "במידה ותרצו לעדכן את מספר האורחים, פשוט תכתבו פה מספר חדש!",
        from: twilioPhoneNumber,
        to: sender.Phone,
      })
      .then(() => {
        console.log(`Message sent to ${sender.Name} (${sender.Phone})`);
      })
      .catch((err) => {
        console.error(
          `Failed to send message to ${sender.Name} (${sender.Phone})`,
          err
        );
      });
  }

  res.send("<Response></Response>"); // Respond to Twilio to acknowledge the message
});

//send an SMS message
app.post("/sendMessage", (req, res) => {
  filterGuestsOption = req.body.filterOption;
  message = req.body.message;

  let filterGuestsList = guestsList.filter((guest) => {
    if (filterGuestsOption === "all") {
      return true;
    } else if (filterGuestsOption === "noRsvp") {
      return !guest.RSVP;
    } else {
      return guest.RSVP > 0;
    }
  });

  filterGuestsList.forEach((guest) => {
    const name = guest.Name;
    const phone = guest.Phone;
    const messageToSend = message.replace("***", name);

    twilioClient.messages
      .create({
        body: messageToSend,
        from: twilioPhoneNumber,
        to: phone,
      })
      .then(() => {
        console.log(`Message sent to ${name} (${phone})`);
      })
      .catch((err) => {
        console.error(`Failed to send message to ${name} (${phone})`, err);
      });
  });

  res.status(200).send("Messages sent");
});

// get guests with RSVP not null
app.get("/rsvp", async (req, res) => {
  try {
    const guestsWithRSVP = guestsList.filter((guest) => guest.RSVP !== null);
    res.json(guestsWithRSVP);
  } catch (error) {
    console.error("Error retrieving guests with RSVP:", error);
    res.status(500).send("Error retrieving guests with RSVP");
  }
});

// Endpoint to get the list of guests
app.get("/guestsList", async (req, res) => {
  try {
    guestsList = await db.get();
    res.json(guestsList);
  } catch (error) {
    console.error("Error retrieving guest list:", error);
    res.status(500).send("Error retrieving guest list");
  }
});

// Add a new guest
app.patch("/add", async (req, res) => {
  await db.add(req.body);
  guestsList = await db.get();
  return res.status(200).send(guestsList);
});

// Reset all data
app.delete("/resetDatabase", async (req, res) => {
  try {
    await db.deleteAllData();
    guestsList = await db.get();
    return res.status(200).send(guestsList);
  } catch (error) {
    console.error("Error erasing data in guestsList table:", error);
    return res.status(500).send("Failed to erase data in guestsList table.");
  }
});

// Delete a guest
app.delete("/deleteGuest", async (req, res) => {
  try {
    await db.delete(req.body);
    guestsList = await db.get();
    return res.status(200).send(guestsList);
  } catch (error) {
    console.error("Error erasing data in guestsList table:", error);
    return res.status(500).send("Failed to erase data in guestsList table.");
  }
});

app.listen(3002, async () => {
  db = await Database.connect();
  console.log("connected");
  guestsList = await db.get();
  console.log("server started");
});
