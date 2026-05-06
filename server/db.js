const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/taskmanager.db');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const client = createClient({ url: `file:${DB_PATH}` });

const db = {
  async get(sql, params = []) {
    const r = await client.execute({ sql, args: params });
    return r.rows[0] ? Object.fromEntries(Object.entries(r.rows[0])) : null;
  },
  async all(sql, params = []) {
    const r = await client.execute({ sql, args: params });
    return r.rows.map(row => Object.fromEntries(Object.entries(row)));
  },
  async run(sql, params = []) {
    const r = await client.execute({ sql, args: params });
    return { lastInsertRowid: Number(r.lastInsertRowid), changes: r.rowsAffected };
  }
};

async function initDB() {
  await client.execute(`PRAGMA journal_mode = WAL`);
  await client.execute(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, description TEXT,
    owner_id INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS project_members (
    project_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL, description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    project_id INTEGER NOT NULL, assigned_to INTEGER,
    created_by INTEGER NOT NULL, due_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`);
  console.log('✅ Database ready');
}
initDB().catch(console.error);
module.exports = db;