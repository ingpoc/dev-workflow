const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../data/workflow.db'));

// Initialize tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS patterns (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    algorithm_version TEXT,
    validation_status TEXT,
    template_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS project_context (
    id INTEGER PRIMARY KEY,
    project_name TEXT NOT NULL,
    session_id TEXT NOT NULL,
    state JSON,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS project_checkpoints (
    id INTEGER PRIMARY KEY,
    session_id TEXT NOT NULL,
    state_snapshot JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;