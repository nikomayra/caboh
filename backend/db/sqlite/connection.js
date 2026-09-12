const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../../config/config');
const logger = require('../../utils/logger');

let db = null;

/**
 * Open (or return) the shared SQLite connection and ensure the data directory exists.
 * @returns {import('better-sqlite3').Database}
 */
const getConnection = () => {
  if (db) return db;

  const dir = path.dirname(config.SQLITE_PATH);
  fs.mkdirSync(dir, { recursive: true });

  db = new Database(config.SQLITE_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  logger.info('connected to SQLite at', config.SQLITE_PATH);
  return db;
};

/**
 * Close the SQLite connection if open.
 */
const closeConnection = () => {
  if (db) {
    db.close();
    db = null;
  }
};

module.exports = {
  getConnection,
  closeConnection,
};
