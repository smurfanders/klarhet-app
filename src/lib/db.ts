import Database from 'better-sqlite3'
import path from 'path'

// ─────────────────────────────────────────────────────────────────────────────
// Single SQLite connection — reused across requests.
// The database file is created automatically on first run.
// ─────────────────────────────────────────────────────────────────────────────

const DB_PATH = path.join(process.cwd(), 'klarhet.db')

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined
}

function getDb(): Database.Database {
  if (global.__db) return global.__db

  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  initSchema(db)

  global.__db = db
  return db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user (
      id          TEXT PRIMARY KEY DEFAULT 'owner',
      email       TEXT NOT NULL UNIQUE,
      password    TEXT NOT NULL,
      name        TEXT,
      photo_url   TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS applications (
      id             TEXT PRIMARY KEY,
      company        TEXT NOT NULL,
      role           TEXT NOT NULL,
      language       TEXT NOT NULL DEFAULT 'en'
                       CHECK (language IN ('en', 'sv')),
      token          TEXT NOT NULL UNIQUE,
      interview_date TEXT,
      created_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_applications_token
      ON applications(token);

    CREATE TABLE IF NOT EXISTS responses (
      id               TEXT PRIMARY KEY,
      application_id   TEXT NOT NULL
                         REFERENCES applications(id) ON DELETE CASCADE,
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
      UNIQUE (application_id)
    );

    CREATE INDEX IF NOT EXISTS idx_responses_application_id
      ON responses(application_id);

    CREATE TABLE IF NOT EXISTS rate_limit_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_hash    TEXT NOT NULL,
      action     TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_rate_limit
      ON rate_limit_log(ip_hash, action, created_at);
  `)
}

export default getDb
