import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'cache.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY,
      season INTEGER NOT NULL,
      round INTEGER NOT NULL,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      venue TEXT,
      date TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_matches_season_round ON matches(season, round);

    CREATE TABLE IF NOT EXISTS worm_data (
      match_id INTEGER PRIMARY KEY,
      data_json TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'final_score'
    );

    CREATE TABLE IF NOT EXISTS similarity_cache (
      match_id INTEGER NOT NULL,
      similar_match_id INTEGER NOT NULL,
      score REAL NOT NULL,
      method TEXT NOT NULL DEFAULT 'quarter',
      computed_at TEXT NOT NULL,
      PRIMARY KEY (match_id, method)
    );
  `);
}
