import { Guest, User } from "./types"; // Assuming you have a `types.ts` file for type definitions

require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

class Database {
  // Static method to create a new instance of Database
  static async connect(): Promise<Database> {
    return new Database();
  }

  // Add or update user (Google login)
  async addUser(
    userID: User["userID"],
    email: User["email"],
    name: User["name"]
  ): Promise<void> {
    const query = `
      INSERT INTO Users (userID, email, name) 
      VALUES ($1, $2, $3)
      ON CONFLICT (userID) 
      DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
      RETURNING userID;
    `;
    const values = [userID, email, name];
    await this.runQuery(query, values);
  }

  // Get all guests for a specific user
  async getGuests(userID: User["userID"]): Promise<Guest[]> {
    const query = "SELECT * FROM GuestsList WHERE UserID = $1;";
    const results = await this.runQuery(query, [userID]);
    return results;
  }

  async getAllGuests(): Promise<Guest[]> {
    const query = "SELECT * FROM GuestsList;";
    const results = await this.runQuery(query, []);
    return results;
  }

  // Add a single guest for a user
  async addGuest(userID: User["userID"], guest: Guest): Promise<any> {
    const query = `
      INSERT INTO GuestsList (UserID, name, invitationName, phone, whose, circle, numberOfGuests, RSVP)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;
    const values = [
      userID,
      guest.name,
      guest.invitationName,
      guest.phone,
      guest.whose,
      guest.circle,
      guest.numberOfGuests,
      guest.RSVP,
    ];
    return await this.runQuery(query, values);
  }

  // Add multiple guests for a user
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
          guest.invitationName,
          guest.phone,
          guest.whose,
          guest.circle,
          guest.numberOfGuests,
          guest.RSVP,
        ];

        values.push(...guestValues);

        return `(${guestValues
          .map((_, i) => `$${index * 8 + i + 1}`)
          .join(", ")})`;
      })
      .join(", ");

    const query = `
      INSERT INTO GuestsList (UserID, name, invitationName, phone, whose, circle, numberOfGuests, RSVP)
      VALUES ${placeholders}`;

    return await this.runQuery(query, values);
  }

  // Update RSVP for a specific guest
  async updateRSVP(
    name: Guest["name"],
    phone: Guest["phone"],
    RSVP: number | undefined
  ): Promise<any> {
    let updatedRSVP: number | null;
    if (RSVP == null) {
      updatedRSVP = null;
    } else {
      updatedRSVP = parseInt(RSVP.toString(), 10);
    }

    const query = `
      UPDATE GuestsList 
      SET RSVP = $1 
      WHERE phone = $2 
      AND name = $3
    `;
    const values = [updatedRSVP, phone, name];

    return await this.runQuery(query, values);
  }

  // Delete a specific guest
  async deleteGuest(userID: User["userID"], guest: Guest): Promise<any> {
    return await this.runQuery(
      "DELETE FROM guests WHERE UserID = $1 AND phone = $2 AND name = $3;",
      [userID, guest.phone, guest.name]
    );
  }

  // Delete all guests for a user
  async deleteAllGuests(userID: User["userID"]): Promise<any> {
    return await this.runQuery("DELETE FROM GuestsList WHERE UserID = $1;", [
      userID,
    ]);
  }

  // Run queries safely using the Neon serverless connection
  async runQuery(query: string, values: any[]): Promise<any> {
    try {
      const result = await sql(query, ...values);
      return result;
    } catch (err) {
      console.error("Query failed:", query, values, err);
      throw err;
    }
  }
}

export default Database;
