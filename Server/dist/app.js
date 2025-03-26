"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const twilio_1 = __importDefault(require("twilio"));
const dbUtilsPostgresNeon_1 = __importDefault(require("./dbUtilsPostgresNeon"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
let db;
const twilioClient = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
app.post("/sms", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Body, From } = req.body;
        if (!From || !Body) {
            return res.status(400).send("<Response></Response>");
        }
        const guestsList = yield db.getAllGuests();
        const sender = guestsList.find((guest) => guest.phone === From);
        if (!sender) {
            console.log(`Phone number not found in guest list: ${From}`);
            return res.send("<Response></Response>");
        }
        const rsvpNumber = parseInt(Body, 10);
        if (isNaN(rsvpNumber) || rsvpNumber < 0 || rsvpNumber > 15) {
            console.log(`Invalid RSVP number: ${Body}. Must be between 0 and 15.`);
            yield twilioClient.messages.create({
                body: "תשובתך אינה תקינה. אנא שלח מספר בין 0 ל-15.",
                from: twilioPhoneNumber,
                to: From,
            });
            return res.send("<Response></Response>");
        }
        console.log(`Received RSVP from ${sender.name}: ${Body}`);
        try {
            yield db.updateRSVP(sender.name, sender.phone, rsvpNumber);
            console.log("Guest list updated and RSVP saved");
        }
        catch (dbError) {
            console.error("Failed to update RSVP in the database:", dbError);
            yield twilioClient.messages.create({
                body: "שגיאה בעדכון תשובתך במערכת. אנא נסה שוב מאוחר יותר.",
                from: twilioPhoneNumber,
                to: From,
            });
            return res.send("<Response></Response>");
        }
        yield twilioClient.messages.create({
            body: `\nתודה על תשובתך! מספר האורחים שעודכן: ${rsvpNumber}\nבמידה ותרצו לעדכן, שלחו מספר חדש.`,
            from: twilioPhoneNumber,
            to: sender.phone,
        });
        res.send("<Response></Response>");
    }
    catch (error) {
        console.error("Error processing SMS:", error);
        res.status(500).send("Server error");
    }
}));
app.post("/updateRsvp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID, guest } = req.body;
        yield db.updateRSVP(guest.name, guest.phone, guest.RSVP);
        console.log("RSVP updated");
        const guestsList = yield db.getGuests(userID);
        res.status(200).send(guestsList);
    }
    catch (error) {
        console.error("Error updating RSVP:", error);
        res.status(500).send("Failed to update RSVP");
    }
}));
app.post("/sendMessage", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID, filterOption, message, } = req.body;
        const guestsList = yield db.getGuests(userID);
        const filteredGuests = guestsList.filter((guest) => {
            if (filterOption === "all")
                return true;
            if (filterOption === "noRsvp")
                return !guest.RSVP;
            return guest.RSVP && guest.RSVP > 0;
        });
        yield Promise.all(filteredGuests.map((guest) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const personalizedMessage = message.replace("***", guest.name);
                yield twilioClient.messages.create({
                    body: personalizedMessage,
                    from: twilioPhoneNumber,
                    to: guest.phone,
                });
                console.log(`Message sent to ${guest.name} (${guest.phone})`);
            }
            catch (twilioError) {
                console.error(`Failed to send message to ${guest.name} (${guest.phone})`, twilioError);
            }
        })));
        res.status(200).send("Messages sent");
    }
    catch (error) {
        console.error("Error sending messages:", error);
        res.status(500).send("Failed to send messages");
    }
}));
app.post("/guestsList", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.body;
        const guestsList = yield db.getGuests(userID);
        res.status(200).json(guestsList);
    }
    catch (error) {
        console.error("Error retrieving guest list:", error);
        res.status(500).send("Error retrieving guest list");
    }
}));
app.patch("/addGuests", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { guestsToAdd, userID, } = req.body;
        if (!Array.isArray(guestsToAdd)) {
            return res.status(400).send("Invalid input: expected an array of guests");
        }
        guestsToAdd.forEach((guest) => {
            if (!guest.invitationName || guest.invitationName === "") {
                guest.invitationName = guest.name;
            }
        });
        yield db.addMultipleGuests(userID, guestsToAdd);
        const guestsList = yield db.getGuests(userID);
        console.log(`Added ${guestsToAdd.length} guests. Total: ${guestsList.length}`);
        res.status(200).send(guestsList);
    }
    catch (error) {
        console.error("Error adding guests:", error);
        res.status(500).send("Failed to add guests");
    }
}));
app.patch("/addUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Adding user");
        const { newUser } = req.body;
        yield db.addUser(newUser);
        const guestsList = yield db.getGuests(newUser.userID);
        console.log(`Added User ${newUser.name}. user id: ${newUser.userID}.`);
        res.status(200).send(guestsList);
    }
    catch (error) {
        console.error("Error adding guests:", error);
        res.status(500).send("Failed to add guests");
    }
}));
app.delete("/deleteAllGuests", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.body;
        yield db.deleteAllGuests(userID);
        const guestsList = yield db.getGuests(userID);
        console.log(`All guests of user ${userID} were deleted`);
        res.status(200).send(guestsList);
    }
    catch (error) {
        console.error("Error erasing guest list:", error);
        res.status(500).send("Failed to reset database");
    }
}));
app.delete("/deleteGuest", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID, guest, } = req.body;
        yield db.deleteGuest(userID, guest);
        const guestsList = yield db.getGuests(userID);
        res.status(200).send(guestsList);
    }
    catch (error) {
        console.error("Error deleting guest:", error);
        res.status(500).send("Failed to delete guest");
    }
}));
app.listen(3002, () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        db = yield dbUtilsPostgresNeon_1.default.connect();
        console.log("Connected to database");
    }
    catch (error) {
        console.error("Server startup error:", error);
    }
}));
