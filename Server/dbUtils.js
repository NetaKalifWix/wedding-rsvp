require("dotenv").config();

const mysql = require("mysql2");

class Database {
  constructor() {
    this.connection = mysql.createConnection({
      host: process.env.DB_EXTERNAL_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_NAME,
      port: process.env.DB_PORT,
      charset: "utf8mb4",
    });

    this.connection.connect((err) => {
      if (err) {
        console.error("Connection to database failed:", err);
      } else {
        console.log("Connected to the database");
      }
    });
  }

  static async connect() {
    const db = new Database();
    return db;
  }

  /*
  ==============================================
                GuestsList table
  ==============================================
  */

  async add(guest) {
    return await this.runQuery(
      "INSERT INTO GuestsList (Name, Phone, Whose, Circle, RSVP) VALUES (?, ?, ?, ?, ?);",
      [guest.Name, guest.Phone, guest.Whose, guest.Circle, guest.RSVP]
    );
  }

  async updateRSVP(guest) {
    const rsvpInt = parseInt(guest.RSVP, 10);
    const query = "UPDATE GuestsList SET RSVP = ? WHERE Phone = ? AND Name = ?";
    const values = [rsvpInt, guest.Phone, guest.Name];
    return await this.runQuery(query, values);
  }

  async delete(invitation) {
    return await this.runQuery(
      "DELETE FROM GuestsList WHERE Phone = ? AND Name = ?;",
      [invitation.Phone, invitation.Name]
    );
  }

  async get() {
    return await this.runQuery("SELECT * FROM GuestsList;");
  }

  async deleteAllData() {
    return await this.runQuery("DELETE FROM GuestsList;");
  }

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
