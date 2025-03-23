const fs = require("fs");
const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const cors = require("cors");
const Database = require("./dbUtils");

const app = express();
app.use(express.json());
app.use(cors());

let isConnectedToQR = false;

let db, guestsList, filterGuestsOption, message;

const whatsApp = new Client({
  authStrategy: new LocalAuth(),
  webVersionCache: {
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    type: "remote",
  },
  puppeteer: {
    headless: true,
    args: ["--no-sandbox"],
  },
});

whatsApp.on("message", async (message) => {
  console.log(`the message is from: ${message.from}`);
  const sender = guestsList.find(
    (guest) => `${guest.Phone}@c.us` === message.from
  );

  if (sender) {
    console.log(`Received RSVP from ${sender.name}: ${message.body}`);
    db.updateRSVP({
      name: sender.name,
      Phone: sender.Phone,
      RSVP: message.body,
    });
    guestsList = await db.get();
    console.log("Guest list updated and RSVP saved");
  }
});

app.get("/isConnectedToQR", async (req, res) => {
  res.status(200).send({ isConnectedToQR });
});

app.get("/connectToBot", async (req, res) => {
  try {
    whatsApp.initialize();
    console.log("starting the qr process");
    whatsApp.on("qr", (qr) => {
      isConnectedToQR = true;
      res.status(200).send(qr);
      console.log("sended the qr");
    });
    whatsApp.on("ready", () => {
      console.log("Client is ready!");
    });
    console.log("finish initialize whatsapp on");
  } catch (error) {
    console.error("Error retrieving guests with RSVP:", error);
    res.status(500).send("Error retrieving guests with RSVP");
  }
});

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
    const name = guest.name;
    const phone = guest.Phone;
    const messageToSend = message.replace("***", name);

    whatsApp
      .sendMessage(`${phone}@c.us`, messageToSend)
      .then(() => {
        console.log(`Message sent to ${name} (${phone})`);
      })
      .catch((err) => {
        console.error(`Failed to send message to ${name} (${phone})`, err);
      });
  });
});

// Express API endpoint to get guests with RSVP not null
app.get("/rsvp", async (req, res) => {
  try {
    const guestsWithRSVP = guestsList.filter((guest) => guest.RSVP !== null);
    res.json(guestsWithRSVP);
  } catch (error) {
    console.error("Error retrieving guests with RSVP:", error);
    res.status(500).send("Error retrieving guests with RSVP");
  }
});

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
  await db.add(req.body);
  guestsList = await db.get();
  return res.status(200).send(guestsList);
});

app.delete("/resetDatabase", async (req, res) => {
  console.log("Request from:", req.get("host"), "to /resetDatabase");
  try {
    await db.deleteAllData();
    guestsList = await db.get();
    return res.status(200).send(guestsList);
  } catch (error) {
    console.error("Error erasing data in guestsList table:", error);
    return res.status(500).send("Failed to erase data in guestsList table.");
  }
});

app.delete("/deleteGuest", async (req, res) => {
  console.log("Request from:", req.get("host"), "to /deleteGuest");
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
  console.log(guestsList);
  console.log("server started");
});
