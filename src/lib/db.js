import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'app.db')
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

export const db = new sqlite3.Database(dbPath)

export function run (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err)
      resolve({ id: this.lastID, changes: this.changes })
    })
  })
}

export function get (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function (err, row) {
      if (err) return reject(err)
      resolve(row)
    })
  })
}

export function all (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function (err, rows) {
      if (err) return reject(err)
      resolve(rows)
    })
  })
}

export async function ensureDb () {
  await run(`PRAGMA foreign_keys = ON;`)
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'agent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await run(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      address TEXT,
      property_details TEXT,
      starts_at DATETIME,
      qr_token TEXT UNIQUE NOT NULL,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
  // Attempt to add new column for customizable sign-in form schema
  try { await run(`ALTER TABLE events ADD COLUMN form_schema TEXT;`) } catch (_) {}
  await run(`
    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      budget TEXT,
      timeline TEXT,
      preapproved INTEGER DEFAULT 0,
      neighborhoods TEXT,
      consent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await run(`
    CREATE TABLE IF NOT EXISTS signins (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE
    );
  `)
  // Attempt to add column to store extra answers for custom questions
  try { await run(`ALTER TABLE signins ADD COLUMN extra_answers TEXT;`) } catch (_) {}
  await run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      event_id TEXT,
      visitor_id TEXT,
      channel TEXT NOT NULL,
      template TEXT,
      status TEXT DEFAULT 'queued',
      meta TEXT,
      sent_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
      FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE SET NULL
    );
  `)
}
