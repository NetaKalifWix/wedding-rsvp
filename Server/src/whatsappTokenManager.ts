import axios from "axios";
import dotenv from "dotenv";
import Database from "./dbUtilsPostgresNeon";

dotenv.config();

let db: Database;
let cachedToken: string | null = null;

// Initialize database connection - only called once at startup
const initializeDB = async () => {
  if (!db) {
    db = await Database.connect();
    await createTokenTable();
    // Try to load initial token from database
    const initialToken = await loadTokenFromDB();
    if (initialToken) {
      cachedToken = initialToken;
    }
  }
};

// Create token table if it doesn't exist - now with a single row design
const createTokenTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS whatsapp_token (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      access_token TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.runQuery(query, []);
};

const loadTokenFromDB = async () => {
  const query = `SELECT access_token FROM whatsapp_token WHERE id = 1;`;
  const result = await db.runQuery(query, []);
  return result[0]?.access_token || process.env.WHATSAPP_ACCESS_TOKEN || "";
};

export const getAccessToken = async () => {
  // Return cached token if available
  if (cachedToken) {
    return cachedToken;
  }

  // If no cached token, initialize DB if needed and load from database
  await initializeDB();
  if (cachedToken) {
    return cachedToken;
  }
  const token = await loadTokenFromDB();
  cachedToken = token; // Cache the token for future use
  return token;
};

export const refreshAccessToken = async () => {
  try {
    const currentToken = await getAccessToken();

    const response = await axios.post(
      "https://graph.facebook.com/oauth/access_token",
      null,
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: process.env.WHATSAPP_APP_ID,
          client_secret: process.env.WHATSAPP_APP_SECRET,
          fb_exchange_token: currentToken,
        },
      }
    );

    const newToken = response.data.access_token;

    // Update both cache and database

    // Update or insert the new token (upsert)
    const query = `
      INSERT INTO whatsapp_token (id, access_token, updated_at)
      VALUES (1, $1, CURRENT_TIMESTAMP)
      ON CONFLICT (id) 
      DO UPDATE SET 
        access_token = $1,
        updated_at = CURRENT_TIMESTAMP;
    `;
    await db.runQuery(query, [newToken]);

    cachedToken = newToken;

    console.log(
      "✅ Access token refreshed and stored:",
      newToken.slice(0, 10) + "..."
    );
  } catch (error) {
    console.error(
      "❌ Failed to refresh access token:",
      error.response?.data || error.message
    );
    // Clear cached token on error to force database reload on next get
    cachedToken = null;
  }
};

// Initialize the database and load initial token
initializeDB().catch(console.error);

// Refresh token every 50 minutes
setInterval(refreshAccessToken, 50 * 60 * 1000);

// Initial refresh
refreshAccessToken();
