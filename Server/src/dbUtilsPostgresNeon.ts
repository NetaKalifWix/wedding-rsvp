import { Guest, GuestIdentifier, User, WeddingDetails } from "./types"; // Assuming you have a `types.ts` file for type definitions

require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);
const guestsListColumnsNoUserID = `name, phone, whose, circle, "numberOfGuests", "RSVP", "messageGroup"`;

class Database {
  // Static method to create a new instance of Database
  static async connect(): Promise<Database> {
    const db = new Database();
    await db.initializeTables();
    return db;
  }

  private async initializeTables(): Promise<void> {
    // Create info table if it doesn't exist
    const createInfoTableQuery = `
      CREATE TABLE IF NOT EXISTS "info" (
        "userID" TEXT PRIMARY KEY REFERENCES users("userID") ON DELETE CASCADE,
        bride_name TEXT NOT NULL,
        groom_name TEXT NOT NULL,
        wedding_date DATE NOT NULL,
        hour TIME NOT NULL,
        location_name TEXT NOT NULL,
        additional_information TEXT,
        waze_link TEXT,
        gift_link TEXT,
        thank_you_message TEXT,
        "fileID" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.runQuery(createInfoTableQuery, []);

    // Add messageGroup column to guestsList table if it doesn't exist
    const addMessageGroupColumnQuery = `
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'guestsList' 
          AND column_name = 'messageGroup'
        ) THEN 
          ALTER TABLE "guestsList" 
          ADD COLUMN "messageGroup" INTEGER;
        END IF;
      END $$;
    `;
    await this.runQuery(addMessageGroupColumnQuery, []);
  }

  // Add or update user (Google login)
  async addUser({ userID, email, name }: User): Promise<void> {
    const query = `
    INSERT INTO users ("userID", email, name) 
    VALUES ($1, $2, $3)
    ON CONFLICT ("userID") 
    DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
    RETURNING "userID";
  `;
    const values = [userID, email, name];
    await this.runQuery(query, values);
  }

  // Get all guests for a specific user
  async getGuests(userID: User["userID"]): Promise<Guest[]> {
    const query = `SELECT  ${guestsListColumnsNoUserID} FROM "guestsList" WHERE "userID" = $1;`;
    const results = await this.runQuery(query, [userID]);
    return results;
  }

  async getAllGuests(): Promise<Guest[]> {
    const query = `SELECT * FROM "guestsList";`;
    const results = await this.runQuery(query, []);
    return results;
  }

  async addMultipleGuests(
    userID: User["userID"],
    guests: Guest[]
  ): Promise<any> {
    const values: any[] = [];
    const placeholders = guests
      .map((guest, index) => {
        const guestValues = [
          userID,
          guest.name,
          guest.phone,
          guest.whose,
          guest.circle,
          guest.numberOfGuests,
          guest.RSVP,
          guest.messageGroup,
        ];

        values.push(...guestValues);

        return `(${guestValues
          .map((_, i) => `$${index * 8 + i + 1}`) // Updated from 7 to 8 parameters
          .join(", ")})`;
      })
      .join(", ");

    const query = `
    INSERT INTO "guestsList" ("userID", ${guestsListColumnsNoUserID})
    VALUES ${placeholders}
  `;
    return await this.runQuery(query, values);
  }

  // Update RSVP for a specific guest
  async updateRSVP(
    name: Guest["name"],
    phone: Guest["phone"],
    RSVP: number | undefined,
    userID?: string
  ): Promise<any> {
    let updatedRSVP: number | null;
    if (RSVP == null) {
      updatedRSVP = null;
    } else {
      updatedRSVP = parseInt(RSVP.toString(), 10);
    }

    const query = userID
      ? `
      UPDATE "guestsList" 
      SET "RSVP" = $1 
      WHERE "userID" = $2
      AND phone = $3 
      AND name = $4
    `
      : `
      UPDATE "guestsList" 
      SET "RSVP" = $1 
      WHERE phone = $2 
      AND name = $3
    `;
    const values = userID
      ? [updatedRSVP, userID, phone, name]
      : [updatedRSVP, phone, name];

    return await this.runQuery(query, values);
  }

  // Delete a specific guest
  async deleteGuest(
    guest: GuestIdentifier,
    userID?: User["userID"]
  ): Promise<any> {
    return userID
      ? await this.runQuery(
          `DELETE FROM "guestsList" WHERE "userID" = $1 AND phone = $2 AND name = $3;`,
          [userID, guest.phone, guest.name]
        )
      : await this.runQuery(`DELETE FROM "guestsList" WHERE phone = $1;`, [
          guest.phone,
        ]);
  }

  // Delete all guests for a user
  async deleteAllGuests(userID: User["userID"]): Promise<any> {
    return await this.runQuery(
      `DELETE FROM "guestsList" WHERE "userID" = $1;`,
      [userID]
    );
  }
  async deleteUser(userID: User["userID"]): Promise<any> {
    return await this.runQuery(`DELETE FROM "users" WHERE "userID" = $1;`, [
      userID,
    ]);
  }

  // Add or update wedding information
  async saveWeddingInfo(
    userID: User["userID"],
    info: WeddingDetails
  ): Promise<void> {
    const query = `
      INSERT INTO info (
        "userID", bride_name, groom_name, wedding_date, hour, 
        location_name, additional_information, waze_link, gift_link,
        thank_you_message, "fileID"
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT ("userID") 
      DO UPDATE SET 
        bride_name = EXCLUDED.bride_name,
        groom_name = EXCLUDED.groom_name,
        wedding_date = EXCLUDED.wedding_date,
        hour = EXCLUDED.hour,
        location_name = EXCLUDED.location_name,
        additional_information = EXCLUDED.additional_information,
        waze_link = EXCLUDED.waze_link,
        gift_link = EXCLUDED.gift_link,
        thank_you_message = EXCLUDED.thank_you_message,
        "fileID" = EXCLUDED."fileID";
    `;

    const values = [
      userID,
      info.bride_name,
      info.groom_name,
      info.wedding_date,
      info.hour,
      info.location_name,
      info.additional_information,
      info.waze_link,
      info.gift_link,
      info.thank_you_message,
      info.fileID,
    ];

    await this.runQuery(query, values);
  }

  // Get wedding information for a user
  async getWeddingInfo(userID: User["userID"]): Promise<WeddingDetails | null> {
    const query = `
      SELECT 
        bride_name, groom_name, wedding_date, hour, 
        location_name, additional_information, waze_link, 
        gift_link, thank_you_message, "fileID"
      FROM info 
      WHERE "userID" = $1;
    `;

    const results = await this.runQuery(query, [userID]);
    return results.length > 0 ? results[0] : null;
  }

  // Get all weddings that need to send messages today
  async getWeddingsForMessaging(): Promise<
    { userID: string; info: WeddingDetails }[]
  > {
    const query = `
      SELECT 
        "userID",
        bride_name, groom_name, wedding_date, hour, 
        location_name, additional_information, waze_link, 
        gift_link, thank_you_message, "fileID"
      FROM info 
      WHERE 
        wedding_date = CURRENT_DATE
        OR wedding_date = CURRENT_DATE + INTERVAL '1 day'
        OR wedding_date = CURRENT_DATE - INTERVAL '1 day';
    `;

    const results = await this.runQuery(query, []);
    return results.map((row: any) => ({
      userID: row.userID,
      info: {
        bride_name: row.bride_name,
        groom_name: row.groom_name,
        wedding_date: row.wedding_date,
        hour: row.hour,
        location_name: row.location_name,
        additional_information: row.additional_information,
        waze_link: row.waze_link,
        gift_link: row.gift_link,
        thank_you_message: row.thank_you_message,
        fileID: row.fileID,
      },
    }));
  }

  async updateGuestsGroups(
    userID: User["userID"],
    guests: Guest[]
  ): Promise<void> {
    const values: any[] = [];
    const placeholders = guests
      .map((guest, index) => {
        // Ensure messageGroup is a number or null
        const messageGroupValue = guest.messageGroup
          ? parseInt(guest.messageGroup.toString(), 10)
          : null;

        values.push(messageGroupValue, userID, guest.name, guest.phone);
        const offset = index * 4;
        return `($${offset + 1}::integer, $${offset + 2}, $${offset + 3}, $${
          offset + 4
        })`;
      })
      .join(", ");

    const query = `
      UPDATE "guestsList" AS g
      SET "messageGroup" = c.messageGroup
      FROM (VALUES ${placeholders}) AS c(messageGroup, userID, name, phone)
      WHERE g."userID" = c.userID
      AND g.name = c.name
      AND g.phone = c.phone;
    `;

    await this.runQuery(query, values);
  }

  // Run queries safely using the Neon serverless connection
  async runQuery(query: string, values: any[]): Promise<any> {
    try {
      return await sql(query, values);
    } catch (err) {
      console.error("Query failed:", query, values, err);
      throw err;
    }
  }
}

export default Database;
