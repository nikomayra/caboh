const { randomUUID } = require('crypto');
const { getConnection } = require('./connection');
const { toId, toIdArray } = require('../helpers');

/**
 * @param {object} row
 * @returns {object}
 */
const rowToPlayer = (row) => ({
  id: row.id,
  username: row.username,
  gameId: row.gameId,
  hand: JSON.parse(row.hand || '[]'),
  hasDrawnCard: Boolean(row.hasDrawnCard),
  hasSwappedCards: Boolean(row.hasSwappedCards),
  hasViewedCards: Boolean(row.hasViewedCards),
  initialCardsRevealed: Boolean(row.initialCardsRevealed),
});

/**
 * @param {{ findByIdsSync: Function }} cardsRepo
 * @returns {{ create: Function, save: Function, deleteManyByIds: Function, count: Function, deleteAll: Function, findByIdsSync: Function }}
 */
const createPlayersRepo = (cardsRepo) => {
  const db = getConnection();

  /**
   * @param {string[]} ids
   * @param {{ hands?: boolean }} [options]
   * @returns {Map<string, object>}
   */
  const findByIdsSync = (ids, options = {}) => {
    const map = new Map();
    if (!ids || ids.length === 0) return map;

    const placeholders = ids.map(() => '?').join(',');
    const rows = db
      .prepare(`SELECT * FROM players WHERE id IN (${placeholders})`)
      .all(...ids);

    let cardMap = new Map();
    if (options.hands) {
      const allHandIds = [];
      for (const row of rows) {
        allHandIds.push(...JSON.parse(row.hand || '[]'));
      }
      cardMap = cardsRepo.findByIdsSync(allHandIds);
    }

    for (const row of rows) {
      const player = rowToPlayer(row);
      if (options.hands) {
        player.hand = player.hand.map((cardId) => cardMap.get(cardId) || cardId);
      }
      map.set(player.id, player);
    }
    return map;
  };

  /**
   * @param {{ username: string, gameId: string, hand?: unknown[] }} data
   * @returns {Promise<object>}
   */
  const create = async (data) => {
    const id = randomUUID();
    const username = data.username;
    if (!username || /,/.test(username)) {
      throw new Error('Invalid username');
    }
    if (username.length < 1 || username.length > 10) {
      throw new Error('Username must be 1-10 characters');
    }

    try {
      db.prepare(
        `INSERT INTO players (
          id, username, gameId, hand,
          hasDrawnCard, hasSwappedCards, hasViewedCards, initialCardsRevealed
        ) VALUES (
          @id, @username, @gameId, @hand,
          0, 0, 0, 0
        )`
      ).run({
        id,
        username,
        gameId: toId(data.gameId),
        hand: JSON.stringify(toIdArray(data.hand || [])),
      });
    } catch (error) {
      if (error && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        const err = new Error('Player username must be unique within the same game.');
        err.name = 'ValidationError';
        throw err;
      }
      throw error;
    }

    return {
      id,
      username,
      gameId: toId(data.gameId),
      hand: toIdArray(data.hand || []),
      hasDrawnCard: false,
      hasSwappedCards: false,
      hasViewedCards: false,
      initialCardsRevealed: false,
    };
  };

  /**
   * Persist a mutated player plain object.
   * @param {object} player
   * @returns {Promise<object>}
   */
  const save = async (player) => {
    const result = db
      .prepare(
        `UPDATE players SET
          username = @username,
          gameId = @gameId,
          hand = @hand,
          hasDrawnCard = @hasDrawnCard,
          hasSwappedCards = @hasSwappedCards,
          hasViewedCards = @hasViewedCards,
          initialCardsRevealed = @initialCardsRevealed
        WHERE id = @id`
      )
      .run({
        id: player.id,
        username: player.username,
        gameId: toId(player.gameId),
        hand: JSON.stringify(toIdArray(player.hand)),
        hasDrawnCard: player.hasDrawnCard ? 1 : 0,
        hasSwappedCards: player.hasSwappedCards ? 1 : 0,
        hasViewedCards: player.hasViewedCards ? 1 : 0,
        initialCardsRevealed: player.initialCardsRevealed ? 1 : 0,
      });

    if (result.changes === 0) {
      throw new Error('Player not found');
    }
    return player;
  };

  /**
   * @param {string[]} ids
   * @returns {Promise<void>}
   */
  const deleteManyByIds = async (ids) => {
    if (!ids || ids.length === 0) return;
    const placeholders = ids.map(() => '?').join(',');
    db.prepare(`DELETE FROM players WHERE id IN (${placeholders})`).run(
      ...ids.map(toId)
    );
  };

  /**
   * @returns {Promise<number>}
   */
  const count = async () => {
    const row = db.prepare('SELECT COUNT(*) AS count FROM players').get();
    return row.count;
  };

  /**
   * @returns {Promise<void>}
   */
  const deleteAll = async () => {
    db.prepare('DELETE FROM players').run();
  };

  return {
    create,
    save,
    deleteManyByIds,
    count,
    deleteAll,
    findByIdsSync,
  };
};

module.exports = { createPlayersRepo };
