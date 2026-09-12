const { randomUUID } = require('crypto');
const { getConnection } = require('./connection');
const { toId, toIdArray } = require('../helpers');

/**
 * @param {object} row
 * @returns {object}
 */
const rowToGame = (row) => ({
  id: row.id,
  deck: JSON.parse(row.deck || '[]'),
  players: JSON.parse(row.players || '[]'),
  curPlayerTurn: row.curPlayerTurn || '',
  hasStarted: Boolean(row.hasStarted),
  finalRound: Boolean(row.finalRound),
  scoreScreen: Boolean(row.scoreScreen),
  finalScores: JSON.parse(row.finalScores || '[]'),
  lastPlayerTurn: row.lastPlayerTurn || '',
  topDisCard: row.topDisCard || null,
  disCards: JSON.parse(row.disCards || '[]'),
  drawnCard: row.drawnCard || null,
  maxPlayers: row.maxPlayers,
  round: row.round,
  lastTurnSummary: JSON.parse(row.lastTurnSummary || '[]'),
});

/**
 * @param {{ findByIdsSync: Function }} cardsRepo
 * @param {{ findByIdsSync: Function }} playersRepo
 * @returns {object}
 */
const createGamesRepo = (cardsRepo, playersRepo) => {
  const db = getConnection();

  /**
   * Hydrate related entities based on findById options.
   * @param {object} game
   * @param {{
   *   players?: boolean,
   *   hands?: boolean,
   *   deck?: boolean,
   *   disCards?: boolean,
   *   topDisCard?: boolean,
   *   drawnCard?: boolean,
   *   omit?: string[]
   * }} [options]
   * @returns {object}
   */
  const hydrate = (game, options = {}) => {
    const result = { ...game };
    const omit = new Set(options.omit || []);

    if (options.deck) {
      const cardMap = cardsRepo.findByIdsSync(result.deck);
      result.deck = result.deck.map((id) => cardMap.get(id) || id);
    }

    if (options.disCards) {
      const cardMap = cardsRepo.findByIdsSync(result.disCards);
      result.disCards = result.disCards.map((id) => cardMap.get(id) || id);
    }

    if (options.topDisCard && result.topDisCard) {
      const cardMap = cardsRepo.findByIdsSync([result.topDisCard]);
      result.topDisCard = cardMap.get(result.topDisCard) || result.topDisCard;
    }

    if (options.drawnCard && result.drawnCard) {
      const cardMap = cardsRepo.findByIdsSync([result.drawnCard]);
      result.drawnCard = cardMap.get(result.drawnCard) || result.drawnCard;
    }

    if (options.players) {
      const playerMap = playersRepo.findByIdsSync(result.players, {
        hands: Boolean(options.hands),
      });
      // Preserve order stored on the game
      result.players = result.players
        .map((id) => playerMap.get(id))
        .filter(Boolean);
    }

    for (const key of omit) {
      delete result[key];
    }

    return result;
  };

  /**
   * @param {{ deck?: unknown[] }} data
   * @returns {Promise<object>}
   */
  const create = async (data = {}) => {
    const id = randomUUID();
    const deckIds = toIdArray(data.deck || []);

    db.prepare(
      `INSERT INTO games (id, deck) VALUES (@id, @deck)`
    ).run({
      id,
      deck: JSON.stringify(deckIds),
    });

    return rowToGame(
      db.prepare('SELECT * FROM games WHERE id = ?').get(id)
    );
  };

  /**
   * @param {string} id
   * @param {object} [options]
   * @returns {Promise<object|null>}
   */
  const findById = async (id, options = {}) => {
    const row = db.prepare('SELECT * FROM games WHERE id = ?').get(id);
    if (!row) return null;
    return hydrate(rowToGame(row), options);
  };

  /**
   * Persist a mutated game plain object.
   * @param {object} game
   * @returns {Promise<object>}
   */
  const save = async (game) => {
    const result = db
      .prepare(
        `UPDATE games SET
          deck = @deck,
          players = @players,
          curPlayerTurn = @curPlayerTurn,
          hasStarted = @hasStarted,
          finalRound = @finalRound,
          scoreScreen = @scoreScreen,
          finalScores = @finalScores,
          lastPlayerTurn = @lastPlayerTurn,
          topDisCard = @topDisCard,
          disCards = @disCards,
          drawnCard = @drawnCard,
          maxPlayers = @maxPlayers,
          round = @round,
          lastTurnSummary = @lastTurnSummary
        WHERE id = @id`
      )
      .run({
        id: game.id,
        deck: JSON.stringify(toIdArray(game.deck)),
        players: JSON.stringify(toIdArray(game.players)),
        curPlayerTurn: game.curPlayerTurn || '',
        hasStarted: game.hasStarted ? 1 : 0,
        finalRound: game.finalRound ? 1 : 0,
        scoreScreen: game.scoreScreen ? 1 : 0,
        finalScores: JSON.stringify(game.finalScores || []),
        lastPlayerTurn: game.lastPlayerTurn || '',
        topDisCard: toId(game.topDisCard),
        disCards: JSON.stringify(toIdArray(game.disCards)),
        drawnCard: toId(game.drawnCard),
        maxPlayers: game.maxPlayers ?? 6,
        round: game.round ?? 1,
        lastTurnSummary: JSON.stringify(game.lastTurnSummary || []),
      });

    if (result.changes === 0) {
      throw new Error('Game not found');
    }
    return game;
  };

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  const deleteById = async (id) => {
    db.prepare('DELETE FROM games WHERE id = ?').run(id);
  };

  /**
   * @returns {Promise<number>}
   */
  const countStarted = async () => {
    const row = db
      .prepare('SELECT COUNT(*) AS count FROM games WHERE hasStarted = 1')
      .get();
    return row.count;
  };

  /**
   * @returns {Promise<void>}
   */
  const deleteAll = async () => {
    db.prepare('DELETE FROM games').run();
  };

  return {
    create,
    findById,
    save,
    deleteById,
    countStarted,
    deleteAll,
  };
};

module.exports = { createGamesRepo };
