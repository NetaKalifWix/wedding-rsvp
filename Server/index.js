const fs = require("fs");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const XLSX = require("xlsx");
const express = require("express");
const cors = require("cors");
const Database = require("./dbUtils");

const app = express();
app.use(express.json());
app.use(cors());

let db, guestsList;

const whatsApp = new Client({
  authStrategy: new LocalAuth(),
  webVersionCache: {
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.51.html",
    type: "remote",
  },
  puppeteer: {
    headless: true,
    args: ["--no-sandbox"],
  },
});

// whatsApp.on("qr", (qr) => {
//   qrcode.generate(qr, { small: true });
// });

whatsApp.on("ready", () => {
  console.log("Client is ready!");
  const guestsThatHaventRSVP = guestsList.filter((guest) => !guest.RSVP);
  guestsThatHaventRSVP.forEach((guest) => {
    const name = guest.Name;
    const phone = guest.Phone;
    const message = `${name}, נשמח לקראותכם ביום החתונה שלנו! אנא החזירו בהודעה את כמות האנשים שתגיעו (מספר בלבד).`;

    whatsApp
      .sendMessage(`${phone}@c.us`, message)
      .then((response) => {
        console.log(`Message sent to ${name} (${phone})`);
      })
      .catch((err) => {
        console.error(`Failed to send message to ${name} (${phone})`, err);
      });
  });
});

whatsApp.on("message", async (message) => {
  console.log(`the message is from: ${message.from}`);
  const sender = guestsList.find(
    (guest) => `${guest.Phone}@c.us` === message.from
  );

  if (sender) {
    console.log(`Received RSVP from ${sender.Name}: ${message.body}`);
    db.updateRSVP({
      name: sender.Name,
      phone: sender.Phone,
      rsvp: message.body,
    });
    guestsList = await db.get();
    console.log("Guest list updated and RSVP saved");
  }
});

app.get("/sendRSVPInvitations", (req, res) => {
  whatsApp.initialize();
  console.log("starting the qr process");
  whatsApp.on("qr", (qr) => {
    res.send(qr);
    // qrcode.generate(qr, { small: true }, (qr) => res.send(qr));
    console.log("send the qr");
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
    return res.status(500).send("Failed to erase data in exchanges table.");
  }
});

app.listen(3002, async () => {
  db = await Database.connect();
  guestsList = await db.get();
  console.log(guestsList);
  console.log("server started");
});
