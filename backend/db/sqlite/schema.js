/**
 * Create SQLite tables and indexes if they do not already exist.
 * @param {import('better-sqlite3').Database} db
 */
const migrate = (db) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      suit TEXT NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      deck TEXT NOT NULL DEFAULT '[]',
      players TEXT NOT NULL DEFAULT '[]',
      curPlayerTurn TEXT NOT NULL DEFAULT '',
      hasStarted INTEGER NOT NULL DEFAULT 0,
      finalRound INTEGER NOT NULL DEFAULT 0,
      scoreScreen INTEGER NOT NULL DEFAULT 0,
      finalScores TEXT NOT NULL DEFAULT '[]',
      lastPlayerTurn TEXT NOT NULL DEFAULT '',
      topDisCard TEXT,
      disCards TEXT NOT NULL DEFAULT '[]',
      drawnCard TEXT,
      maxPlayers INTEGER NOT NULL DEFAULT 6,
      round INTEGER NOT NULL DEFAULT 1,
      lastTurnSummary TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      gameId TEXT NOT NULL,
      hand TEXT NOT NULL DEFAULT '[]',
      hasDrawnCard INTEGER NOT NULL DEFAULT 0,
      hasSwappedCards INTEGER NOT NULL DEFAULT 0,
      hasViewedCards INTEGER NOT NULL DEFAULT 0,
      initialCardsRevealed INTEGER NOT NULL DEFAULT 0,
      UNIQUE (gameId, username)
    );

    CREATE INDEX IF NOT EXISTS idx_players_gameId ON players(gameId);
  `);
};

module.exports = { migrate };
