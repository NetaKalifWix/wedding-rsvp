// require("dotenv").config();

// const mysql = require("mysql2");

// class Database {
//   constructor() {
//     this.connection = mysql.createConnection({
//       host: process.env.DB_EXTERNAL_HOST,
//       user: process.env.DB_USERNAME,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_DATABASE_NAME,
//       port: process.env.DB_PORT,
//       charset: "utf8mb4",
//       maxIdle: 0,
//       idleTimeout: 60000,
//       enableKeepAlive: true,
//     });

//     this.connection.connect((err) => {
//       if (err) {
//         console.error("Connection to database failed:", err);
//       } else {
//         console.log("Connected to the database");
//       }
//     });
//   }

//   static async connect() {
//     const db = new Database();
//     return db;
//   }

//   /*
//   ==============================================
//                 GuestsList table
//   ==============================================
//   */

//   async add(guest) {
//     return await this.runQuery(
//       "INSERT INTO GuestsList (Name, InvitationName, Phone, Whose, Circle, NumberOfGuests, RSVP) VALUES (?, ?, ?, ?, ?, ?, ?);",
//       [
//         guest.Name,
//         guest.InvitationName,
//         guest.Phone,
//         guest.Whose,
//         guest.Circle,
//         guest.NumberOfGuests,
//         guest.RSVP,
//       ]
//     );
//   }
//   async addMultiple(guests) {
//     const values = guests.map((guest) => [
//       guest.Name,
//       guest.InvitationName,
//       guest.Phone,
//       guest.Whose,
//       guest.Circle,
//       guest.NumberOfGuests,
//       guest.RSVP,
//     ]);

//     const placeholders = guests.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ");
//     const query = `INSERT INTO GuestsList (Name, InvitationName, Phone, Whose, Circle, NumberOfGuests, RSVP) VALUES ${placeholders};`;

//     return await this.runQuery(query, values.flat());
//   }
//   async updateRSVP(guest) {
//     let updatedRSVP;
//     if (guest.RSVP == null) {
//       updatedRSVP = undefined;
//     } else {
//       updatedRSVP = parseInt(guest.RSVP, 10);
//     }
//     const query = "UPDATE GuestsList SET RSVP = ? WHERE Phone = ? AND Name = ?";
//     const values = [updatedRSVP, guest.Phone, guest.Name];
//     return await this.runQuery(query, values);
//   }

//   async delete(invitation) {
//     return await this.runQuery(
//       "DELETE FROM GuestsList WHERE Phone = ? AND Name = ?;",
//       [invitation.Phone, invitation.Name]
//     );
//   }

//   async get() {
//     return await this.runQuery("SELECT * FROM GuestsList;");
//   }

//   async deleteAllData() {
//     return await this.runQuery("DELETE FROM GuestsList;");
//   }

//   async runQuery(queryString, values) {
//     return new Promise((resolve, reject) => {
//       this.connection.query(queryString, values, (err, results) => {
//         if (err) {
//           console.error(
//             "\n\nQuery failed\n\n",
//             queryString,
//             values,
//             "\n\n",
//             err
//           );
//           reject(err);
//         } else {
//           resolve(results);
//         }
//       });
//     });
//   }
// }

// module.exports = Database;
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
      connectionLimit: 10, // Number of connections in the pool
      queueLimit: 0, // No limit on the queue
      waitForConnections: true, // Will wait for connections if the pool is full
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
      "INSERT INTO GuestsList (Name, InvitationName, Phone, Whose, Circle, NumberOfGuests, RSVP) VALUES (?, ?, ?, ?, ?, ?, ?);",
      [
        guest.Name,
        guest.InvitationName,
        guest.Phone,
        guest.Whose,
        guest.Circle,
        guest.NumberOfGuests,
        guest.RSVP,
      ]
    );
  }

  // Add multiple guests
  async addMultiple(guests) {
    const values = guests.map((guest) => [
      guest.Name,
      guest.InvitationName,
      guest.Phone,
      guest.Whose,
      guest.Circle,
      guest.NumberOfGuests,
      guest.RSVP,
    ]);

    const placeholders = guests.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ");
    const query = `INSERT INTO GuestsList (Name, InvitationName, Phone, Whose, Circle, NumberOfGuests, RSVP) VALUES ${placeholders};`;

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
    const query = "UPDATE GuestsList SET RSVP = ? WHERE Phone = ? AND Name = ?";
    const values = [updatedRSVP, guest.Phone, guest.Name];
    return await this.runQuery(query, values);
  }

  // Delete a specific guest
  async delete(invitation) {
    return await this.runQuery(
      "DELETE FROM GuestsList WHERE Phone = ? AND Name = ?;",
      [invitation.Phone, invitation.Name]
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
