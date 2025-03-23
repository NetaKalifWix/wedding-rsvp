require("dotenv").config();
const mysql = require("mysql2");

class Database {
  constructor() {
    this.connection = mysql.createPool({
      host: process.env.DB_EXTERNAL_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_NAME,
      port: process.env.DB_PORT,
      charset: "utf8mb4",
      connectionLimit: 10,
      queueLimit: 0,
      waitForConnections: true,
      debug: false,
    });

    // Handle connection errors
    this.connection.on("error", (err) => {
      console.error("MySQL connection error:", err);
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        // Reconnect if the connection is lost
        console.log("Reconnecting to the database...");
        this.connect();
      } else {
        // If the error is not due to a lost connection, log the error
        console.error("MySQL error:", err);
      }
    });
  }

  // Static method to create a new instance of Database
  static async connect() {
    const db = new Database();
    return db;
  }

  // Example of adding a single guest
  async add(guest) {
    return await this.runQuery(
      "INSERT INTO GuestsList (name, invitationName, phone, whose, circle, numberOfGuests, RSVP) VALUES (?, ?, ?, ?, ?, ?, ?);",
      [
        guest.name,
        guest.invitationName,
        guest.phone,
        guest.whose,
        guest.circle,
        guest.numberOfGuests,
        guest.RSVP,
      ]
    );
  }

  // Add multiple guests
  async addMultiple(guests) {
    const values = guests.map((guest) => [
      guest.name,
      guest.invitationName,
      guest.phone,
      guest.whose,
      guest.circle,
      guest.numberOfGuests,
      guest.RSVP,
    ]);

    const placeholders = guests.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ");
    const query = `INSERT INTO GuestsList (name, invitationName, phone, whose, circle, numberOfGuests, RSVP) VALUES ${placeholders};`;

    return await this.runQuery(query, values.flat());
  }

  // Update RSVP for a guest
  async updateRSVP(guest) {
    let updatedRSVP;
    if (guest.RSVP == null) {
      updatedRSVP = undefined;
    } else {
      updatedRSVP = parseInt(guest.RSVP, 10);
    }
    const query = "UPDATE GuestsList SET RSVP = ? WHERE phone = ? AND name = ?";
    const values = [updatedRSVP, guest.phone, guest.name];
    return await this.runQuery(query, values);
  }

  // Delete a specific guest
  async delete(invitation) {
    return await this.runQuery(
      "DELETE FROM GuestsList WHERE phone = ? AND name = ?;",
      [invitation.phone, invitation.name]
    );
  }

  // Get all guests
  async get() {
    return await this.runQuery("SELECT * FROM GuestsList;");
  }

  // Delete all guest data
  async deleteAllData() {
    return await this.runQuery("DELETE FROM GuestsList;");
  }

  // Running a query
  async runQuery(queryString, values) {
    return new Promise((resolve, reject) => {
      this.connection.query(queryString, values, (err, results) => {
        if (err) {
          console.error(
            "\n\nQuery failed\n\n",
            queryString,
            values,
            "\n\n",
            err
          );
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = Database;
