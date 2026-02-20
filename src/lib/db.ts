import { DatabaseSync } from "node:sqlite";
import path from "path";

// ─────────────────────────────────────────────────────────────────────────────
// Node.js built-in SQLite (available since Node 22, no npm package needed)
// Synchronous API — simple and straightforward for a single-user app.
// ─────────────────────────────────────────────────────────────────────────────

const DB_PATH = path.join(process.cwd(), "klarhet.db");

declare global {
  // eslint-disable-next-line no-var
  var __db: DatabaseSync | undefined;
}

function getDb(): DatabaseSync {
  if (global.__db) {
    initSchema(global.__db);
    return global.__db;
  }

  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");

  initSchema(db);

  global.__db = db;
  return db;
}

function tableExists(db: DatabaseSync, tableName: string): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(tableName) as { name?: string } | undefined;
  return !!row?.name;
}

function columnExists(
  db: DatabaseSync,
  tableName: string,
  columnName: string,
): boolean {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{
    name: string;
  }>;
  return columns.some((column) => column.name === columnName);
}

function migrateLegacySchema(db: DatabaseSync) {
  if (
    tableExists(db, "applications") &&
    !tableExists(db, "feedback_requests")
  ) {
    db.exec("ALTER TABLE applications RENAME TO feedback_requests;");
  }

  if (
    tableExists(db, "responses") &&
    columnExists(db, "responses", "application_id") &&
    !columnExists(db, "responses", "feedback_request_id")
  ) {
    db.exec(
      "ALTER TABLE responses RENAME COLUMN application_id TO feedback_request_id;",
    );
  }
}

function initSchema(db: DatabaseSync) {
  migrateLegacySchema(db);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user (
      id          TEXT PRIMARY KEY DEFAULT 'owner',
      email       TEXT NOT NULL UNIQUE,
      password    TEXT NOT NULL,
      name        TEXT,
      photo_url   TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS feedback_requests (
      id             TEXT PRIMARY KEY,
      company        TEXT NOT NULL,
      role           TEXT NOT NULL,
      language       TEXT NOT NULL DEFAULT 'en'
                       CHECK (language IN ('en', 'sv')),
      token          TEXT NOT NULL UNIQUE,
      interview_date TEXT,
      created_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_feedback_requests_token
      ON feedback_requests(token);

    CREATE TABLE IF NOT EXISTS responses (
      id               TEXT PRIMARY KEY,
      feedback_request_id TEXT NOT NULL
             REFERENCES feedback_requests(id) ON DELETE CASCADE,
      q1_match         TEXT CHECK (q1_match IN ('strong','partial','notfit')),
      q1_detail        TEXT,
      q2_communication TEXT CHECK (q2_communication IN ('excellent','good','develop')),
      q2_checkboxes    TEXT,
      q3_reason        TEXT CHECK (q3_reason IN
                         ('stronger','skill','culture','over','internal','other')),
      q3_detail        TEXT,
      q4_future        TEXT CHECK (q4_future IN ('yes','maybe','unlikely')),
      q4_detail        TEXT,
      q5_rating        INTEGER CHECK (q5_rating BETWEEN 1 AND 5),
      q6_profile       TEXT,
      q7_interview     TEXT,
      q7_other         TEXT,
      submitted_at     TEXT NOT NULL DEFAULT (datetime('now')),
      ip_hash          TEXT,
      UNIQUE (feedback_request_id)
    );

    CREATE INDEX IF NOT EXISTS idx_responses_feedback_request_id
      ON responses(feedback_request_id);

    CREATE TABLE IF NOT EXISTS rate_limit_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_hash    TEXT NOT NULL,
      action     TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_rate_limit
      ON rate_limit_log(ip_hash, action, created_at);
  `);
}

export default getDb;
