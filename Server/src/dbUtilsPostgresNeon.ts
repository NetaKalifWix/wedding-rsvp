import {
  Guest,
  GuestIdentifier,
  User,
  WeddingDetails,
  ClientLog,
  Task,
  DefaultTask,
} from "./types"; // Assuming you have a `types.ts` file for type definitions
import defaultTasks from "./defaultTasks.json";
import { getDateStrings } from "./dateUtils";

require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);
const guestsListColumnsNoUserID = `name, phone, whose, circle, "numberOfGuests", "RSVP", "messageGroup"`;

class Database {
  // Static method to create a new instance of Database
  // static async connect(): Promise<Database> {
  //   const db = new Database();
  //   await db.initializeTables();
  //   return db;
  // }

  private static instance: Database | null = null;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Static method to get the singleton instance
  static getInstance(): Database | null {
    return Database.instance;
  }

  // Static method to create and initialize the database instance
  static async connect(): Promise<Database> {
    if (!Database.instance) {
      const db = new Database();
      await db.initializeTables();
      Database.instance = db;
    }
    return Database.instance;
  }

  private async initializeTables(): Promise<void> {
    // Create info table if it doesn't exist
    const createInfoTableQuery = `
      CREATE TABLE IF NOT EXISTS "info" (
        "userID" TEXT PRIMARY KEY REFERENCES users("userID") ON DELETE CASCADE,
        bride_name TEXT NOT NULL,
        groom_name TEXT NOT NULL,
        wedding_date TEXT NOT NULL,
        hour TIME NOT NULL,
        location_name TEXT NOT NULL,
        additional_information TEXT,
        waze_link TEXT,
        gift_link TEXT,
        thank_you_message TEXT,
        "fileID" TEXT,
        reminder_day TEXT DEFAULT 'day_before' CHECK (reminder_day IN ('day_before', 'wedding_day')),
        reminder_time TIME DEFAULT '10:00:00',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.runQuery(createInfoTableQuery, []);

    // Migrate from old columns to new columns if needed
    const migrateReminderColumnsQuery = `
      DO $$ 
      BEGIN 
        -- Add new columns if they don't exist
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'info' 
          AND column_name = 'reminder_day'
        ) THEN 
          ALTER TABLE "info" 
          ADD COLUMN reminder_day TEXT DEFAULT 'day_before' CHECK (reminder_day IN ('day_before', 'wedding_day'));
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'info' 
          AND column_name = 'reminder_time'
        ) THEN 
          ALTER TABLE "info" 
          ADD COLUMN reminder_time TIME DEFAULT '10:00:00';
        END IF;
        
        -- Drop old columns if they exist
        IF EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'info' 
          AND column_name = 'day_before_reminder_time'
        ) THEN 
          ALTER TABLE "info" 
          DROP COLUMN IF EXISTS day_before_reminder_time;
        END IF;
        
        IF EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'info' 
          AND column_name = 'wedding_day_reminder_time'
        ) THEN 
          ALTER TABLE "info" 
          DROP COLUMN IF EXISTS wedding_day_reminder_time;
        END IF;
      END $$;
    `;
    await this.runQuery(migrateReminderColumnsQuery, []);

    // Create ClientLogs table if it doesn't exist
    const createClientLogsTableQuery = `
      CREATE TABLE IF NOT EXISTS "ClientLogs" (
        id SERIAL PRIMARY KEY,
        "userID" TEXT REFERENCES users("userID") ON DELETE CASCADE,
        message TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.runQuery(createClientLogsTableQuery, []);

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

    // Create Tasks table if it doesn't exist
    const createTasksTableQuery = `
      CREATE TABLE IF NOT EXISTS "tasks" (
        task_id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users("userID") ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        timeline_group VARCHAR(50) NOT NULL,
        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
        priority INTEGER DEFAULT 2 CHECK (priority IN (1, 2, 3)),
        assignee VARCHAR(20) DEFAULT 'both' CHECK (assignee IN ('bride', 'groom', 'both')),
        sort_order INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
      );
    `;
    await this.runQuery(createTasksTableQuery, []);

    // Create index for faster task lookups by user
    const createTasksIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    `;
    await this.runQuery(createTasksIndexQuery, []);
  }

  // Add or update user (Google login)
  async addUser({ userID, email, name }: User): Promise<void> {
    // Check if user already exists
    const existingUser = await this.runQuery(
      `SELECT "userID" FROM users WHERE "userID" = $1`,
      [userID]
    );
    const isNewUser = existingUser.length === 0;

    const query = `
    INSERT INTO users ("userID", email, name) 
    VALUES ($1, $2, $3)
    ON CONFLICT ("userID") 
    DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
    RETURNING "userID";
  `;
    const values = [userID, email, name];
    await this.runQuery(query, values);

    // If this is a new user, populate default tasks
    if (isNewUser) {
      await this.populateDefaultTasks(userID);
    }
  }

  // Populate default tasks for a new user
  async populateDefaultTasks(userID: string): Promise<void> {
    const tasks = defaultTasks as DefaultTask[];

    if (tasks.length === 0) return;

    const values: any[] = [];
    const placeholders = tasks
      .map((task, index) => {
        values.push(userID, task.title, task.timeline_group, index, "both");
        const offset = index * 5;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${
          offset + 4
        }, $${offset + 5})`;
      })
      .join(", ");

    const query = `
      INSERT INTO tasks (user_id, title, timeline_group, sort_order, assignee)
      VALUES ${placeholders};
    `;

    await this.runQuery(query, values);
  }

  // Get all guests for a specific user
  async getGuests(userID: User["userID"]): Promise<Guest[]> {
    const query = `SELECT  ${guestsListColumnsNoUserID} FROM "guestsList" WHERE "userID" = $1;`;
    const results = await this.runQuery(query, [userID]);
    return results;
  }

  async getGuestsWithUserID(userID: User["userID"]): Promise<Guest[]> {
    const query = `SELECT "userID", ${guestsListColumnsNoUserID} FROM "guestsList" WHERE "userID" = $1;`;
    const results = await this.runQuery(query, [userID]);
    return results;
  }

  async getAllGuests(): Promise<Guest[]> {
    const query = `SELECT "userID", ${guestsListColumnsNoUserID} FROM "guestsList";`;
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
        thank_you_message, "fileID", reminder_day, reminder_time
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
        "fileID" = EXCLUDED."fileID",
        reminder_day = EXCLUDED.reminder_day,
        reminder_time = EXCLUDED.reminder_time;
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
      info.reminder_day || "day_before",
      info.reminder_time || "10:00:00",
    ];

    await this.runQuery(query, values);
  }

  // Get wedding information for a user
  async getWeddingInfo(userID: User["userID"]): Promise<WeddingDetails | null> {
    const query = `
      SELECT 
        bride_name, groom_name, wedding_date, hour, 
        location_name, additional_information, waze_link, 
        gift_link, thank_you_message, "fileID",
        reminder_day, reminder_time
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
    const { today, tomorrow, yesterday } = getDateStrings();

    const query = `
      SELECT 
        "userID",
        bride_name, groom_name, wedding_date, hour, 
        location_name, additional_information, waze_link, 
        gift_link, thank_you_message, "fileID",
        reminder_day, reminder_time
      FROM info 
      WHERE wedding_date = $1 OR wedding_date = $2 OR wedding_date = $3;
    `;

    const results = await this.runQuery(query, [today, tomorrow, yesterday]);
    return results.map((row: any) => {
      const { userID, ...info } = row;
      return { userID, info };
    });
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

  // Add a log entry
  async addClientLog(userID: string | null, message: string): Promise<void> {
    const query = `
      INSERT INTO "ClientLogs" ("userID", message)
      VALUES ($1, $2);
    `;
    await this.runQuery(query, [userID, message]);
  }

  // Add multiple log entries in a single batch insert
  async addClientLogsBatch(
    logs: Array<{ userID: string | null; message: string }>
  ): Promise<void> {
    console.log("Adding client logs batch:", logs.length);
    if (logs.length === 0) return;

    const values: any[] = [];
    const placeholders = logs
      .map((log, index) => {
        values.push(log.userID, log.message);
        const offset = index * 2;
        return `($${offset + 1}, $${offset + 2})`;
      })
      .join(", ");

    const query = `
      INSERT INTO "ClientLogs" ("userID", message)
      VALUES ${placeholders};
    `;
    await this.runQuery(query, values);
  }

  // Get all logs for a specific user ordered by creation date (newest first)
  async getClientLogs(userID: string): Promise<ClientLog[]> {
    const query = `
      SELECT id, "userID", message, "createdAt"
      FROM "ClientLogs"
      WHERE "userID" = $1
      ORDER BY "createdAt" DESC;
    `;
    const results = await this.runQuery(query, [userID]);
    return results;
  }

  // Get system logs (where userID is null)
  async getSystemLogs(): Promise<ClientLog[]> {
    const query = `
      SELECT id, "userID", message, "createdAt"
      FROM "ClientLogs"
      WHERE "userID" IS NULL
      ORDER BY "createdAt" DESC;
    `;
    const results = await this.runQuery(query, []);
    return results;
  }

  // Delete logs older than 48 hours for all users
  async cleanupOldLogs(): Promise<number> {
    const query = `
      DELETE FROM "ClientLogs"
      WHERE "createdAt" < NOW() - INTERVAL '48 hours'
      RETURNING id;
    `;
    const results = await this.runQuery(query, []);
    return results.length;
  }

  // Get all users (for admin functionality)
  async getAllUsers(): Promise<User[]> {
    const query = `
      SELECT "userID", email, name
      FROM users
      ORDER BY name;
    `;
    const results = await this.runQuery(query, []);
    return results;
  }

  // ==================== Task Methods ====================

  // Get all tasks for a user (excluding soft-deleted)
  async getTasks(userID: string): Promise<Task[]> {
    const query = `
      SELECT task_id, user_id, title, timeline_group, is_completed, 
             priority, assignee, sort_order, created_at
      FROM tasks
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY 
        CASE timeline_group 
          WHEN 'Just Engaged' THEN 1
          WHEN '12 Months Before' THEN 2
          WHEN '9 Months Before' THEN 3
          WHEN '6 Months Before' THEN 4
          WHEN '3 Months Before' THEN 5
          WHEN '1 Month Before' THEN 6
          WHEN '1 Week Before' THEN 7
          WHEN 'Wedding Day' THEN 8
          ELSE 9
        END,
        sort_order ASC,
        created_at ASC;
    `;
    const results = await this.runQuery(query, [userID]);
    return results;
  }

  // Add a new custom task
  async addTask(
    userID: string,
    task: Pick<Task, "title" | "timeline_group" | "priority" | "assignee">
  ): Promise<Task> {
    // Get the max sort_order for this timeline group
    const maxSortQuery = `
      SELECT COALESCE(MAX(sort_order), 0) + 1 as next_sort
      FROM tasks
      WHERE user_id = $1 AND timeline_group = $2 AND deleted_at IS NULL;
    `;
    const sortResult = await this.runQuery(maxSortQuery, [
      userID,
      task.timeline_group,
    ]);
    const nextSort = sortResult[0]?.next_sort || 1;

    const query = `
      INSERT INTO tasks (user_id, title, timeline_group, priority, assignee, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING task_id, user_id, title, timeline_group, is_completed, 
                priority, assignee, sort_order, created_at;
    `;
    const values = [
      userID,
      task.title,
      task.timeline_group,
      task.priority || 2,
      task.assignee || "both",
      nextSort,
    ];
    const result = await this.runQuery(query, values);
    return result[0];
  }

  // Update task completion status
  async updateTaskCompletion(
    userID: string,
    taskId: number,
    isCompleted: boolean
  ): Promise<Task | null> {
    const query = `
      UPDATE tasks
      SET is_completed = $1
      WHERE task_id = $2 AND user_id = $3 AND deleted_at IS NULL
      RETURNING task_id, user_id, title, timeline_group, is_completed, 
                priority, assignee, sort_order, created_at;
    `;
    const result = await this.runQuery(query, [isCompleted, taskId, userID]);
    return result.length > 0 ? result[0] : null;
  }

  // Update task details
  async updateTask(
    userID: string,
    taskId: number,
    updates: Partial<
      Pick<Task, "title" | "timeline_group" | "priority" | "assignee">
    >
  ): Promise<Task | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.timeline_group !== undefined) {
      setClauses.push(`timeline_group = $${paramIndex++}`);
      values.push(updates.timeline_group);
    }
    if (updates.priority !== undefined) {
      setClauses.push(`priority = $${paramIndex++}`);
      values.push(updates.priority);
    }
    if (updates.assignee !== undefined) {
      setClauses.push(`assignee = $${paramIndex++}`);
      values.push(updates.assignee);
    }

    if (setClauses.length === 0) return null;

    values.push(taskId, userID);
    const query = `
      UPDATE tasks
      SET ${setClauses.join(", ")}
      WHERE task_id = $${paramIndex++} AND user_id = $${paramIndex} AND deleted_at IS NULL
      RETURNING task_id, user_id, title, timeline_group, is_completed, 
                priority, assignee, sort_order, created_at;
    `;
    const result = await this.runQuery(query, values);
    return result.length > 0 ? result[0] : null;
  }

  // Soft delete a task
  async deleteTask(userID: string, taskId: number): Promise<boolean> {
    const query = `
      UPDATE tasks
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE task_id = $1 AND user_id = $2 AND deleted_at IS NULL
      RETURNING task_id;
    `;
    const result = await this.runQuery(query, [taskId, userID]);
    return result.length > 0;
  }

  // Update task sort order (for drag and drop reordering)
  async updateTaskOrder(
    userID: string,
    taskId: number,
    newSortOrder: number,
    newTimelineGroup?: string
  ): Promise<Task | null> {
    const setClauses = ["sort_order = $1"];
    const values: any[] = [newSortOrder];
    let paramIndex = 2;

    if (newTimelineGroup !== undefined) {
      setClauses.push(`timeline_group = $${paramIndex++}`);
      values.push(newTimelineGroup);
    }

    values.push(taskId, userID);
    const query = `
      UPDATE tasks
      SET ${setClauses.join(", ")}
      WHERE task_id = $${paramIndex++} AND user_id = $${paramIndex} AND deleted_at IS NULL
      RETURNING task_id, user_id, title, timeline_group, is_completed, 
                priority, assignee, sort_order, created_at;
    `;
    const result = await this.runQuery(query, values);
    return result.length > 0 ? result[0] : null;
  }

  // Get task statistics for a user
  async getTaskStats(
    userID: string
  ): Promise<{ total: number; completed: number }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_completed = true) as completed
      FROM tasks
      WHERE user_id = $1 AND deleted_at IS NULL;
    `;
    const result = await this.runQuery(query, [userID]);
    return {
      total: parseInt(result[0]?.total || "0"),
      completed: parseInt(result[0]?.completed || "0"),
    };
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
