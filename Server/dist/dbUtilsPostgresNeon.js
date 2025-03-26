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
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
class Database {
    // Static method to create a new instance of Database
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Database();
        });
    }
    // Add or update user (Google login)
    addUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userID, email, name }) {
            const query = `
    INSERT INTO users ("userID", email, name) 
    VALUES ($1, $2, $3)
    ON CONFLICT ("userID") 
    DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
    RETURNING "userID";
  `;
            const values = [userID, email, name];
            yield this.runQuery(query, values);
        });
    }
    // Get all guests for a specific user
    getGuests(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM "guestsList" WHERE "userID" = $1;`;
            const results = yield this.runQuery(query, [userID]);
            return results;
        });
    }
    getAllGuests() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM "guestsList";`;
            const results = yield this.runQuery(query, []);
            return results;
        });
    }
    addMultipleGuests(userID, guests) {
        return __awaiter(this, void 0, void 0, function* () {
            const values = [];
            const placeholders = guests
                .map((guest, index) => {
                const guestValues = [
                    userID,
                    guest.name,
                    guest.invitationName,
                    guest.phone,
                    guest.whose,
                    guest.circle,
                    guest.numberOfGuests,
                    guest.RSVP,
                ];
                values.push(...guestValues);
                return `(${guestValues
                    .map((_, i) => `$${index * 8 + i + 1}`) // Generate placeholders starting from the correct index
                    .join(", ")})`;
            })
                .join(", ");
            const query = `
    INSERT INTO "guestsList" ("userID", name, "invitationName", phone, whose, circle, "numberOfGuests", "RSVP")
    VALUES ${placeholders}
  `;
            return yield this.runQuery(query, values);
        });
    }
    // Update RSVP for a specific guest
    updateRSVP(name, phone, RSVP) {
        return __awaiter(this, void 0, void 0, function* () {
            let updatedRSVP;
            if (RSVP == null) {
                updatedRSVP = null;
            }
            else {
                updatedRSVP = parseInt(RSVP.toString(), 10);
            }
            const query = `
      UPDATE "guestsList" 
      SET "RSVP" = $1 
      WHERE phone = $2 
      AND name = $3
    `;
            const values = [updatedRSVP, phone, name];
            return yield this.runQuery(query, values);
        });
    }
    // Delete a specific guest
    deleteGuest(userID, guest) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.runQuery(`DELETE FROM "guestsList" WHERE "userID" = $1 AND phone = $2 AND name = $3;`, [userID, guest.phone, guest.name]);
        });
    }
    // Delete all guests for a user
    deleteAllGuests(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.runQuery(`DELETE FROM "guestsList" WHERE "userID" = $1;`, [userID]);
        });
    }
    // Run queries safely using the Neon serverless connection
    runQuery(query, values) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield sql(query, values);
            }
            catch (err) {
                console.error("Query failed:", query, values, err);
                throw err;
            }
        });
    }
}
exports.default = Database;
