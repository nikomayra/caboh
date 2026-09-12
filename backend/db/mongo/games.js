const Game = require('../../models/game');
const { toId, toIdArray, toPlain } = require('../helpers');

/**
 * Build a mongoose query with populate/select from repository options.
 * @param {import('mongoose').Query} query
 * @param {{
 *   players?: boolean,
 *   hands?: boolean,
 *   deck?: boolean,
 *   disCards?: boolean,
 *   topDisCard?: boolean,
 *   drawnCard?: boolean,
 *   omit?: string[]
 * }} options
 */
const applyOptions = (query, options = {}) => {
  if (options.players && options.hands) {
    query = query.populate({
      path: 'players',
      populate: {
        path: 'hand',
        model: 'Card',
      },
    });
  } else if (options.players) {
    query = query.populate('players');
  }

  if (options.deck) {
    query = query.populate('deck');
  }
  if (options.disCards) {
    query = query.populate('disCards');
  }
  if (options.topDisCard) {
    query = query.populate('topDisCard');
  }
  if (options.drawnCard) {
    query = query.populate('drawnCard');
  }

  for (const field of options.omit || []) {
    query = query.select(`-${field}`);
  }

  return query;
};

/**
 * @returns {object}
 */
const createGamesRepo = () => {
  /**
   * @param {{ deck?: unknown[] }} data
   * @returns {Promise<object>}
   */
  const create = async (data = {}) => {
    const game = new Game({
      deck: toIdArray(data.deck || []),
    });
    const saved = await game.save();
    return toPlain(saved);
  };

  /**
   * @param {string} id
   * @param {object} [options]
   * @returns {Promise<object|null>}
   */
  const findById = async (id, options = {}) => {
    let query = Game.findById(id);
    query = applyOptions(query, options);
    const doc = await query;
    return toPlain(doc);
  };

  /**
   * Persist a mutated game plain object.
   * @param {object} game
   * @returns {Promise<object>}
   */
  const save = async (game) => {
    const doc = await Game.findById(game.id);
    if (!doc) throw new Error('Game not found');

    doc.deck = toIdArray(game.deck);
    doc.players = toIdArray(game.players);
    doc.curPlayerTurn = game.curPlayerTurn || '';
    doc.hasStarted = Boolean(game.hasStarted);
    doc.finalRound = Boolean(game.finalRound);
    doc.scoreScreen = Boolean(game.scoreScreen);
    doc.finalScores = game.finalScores || [];
    doc.lastPlayerTurn = game.lastPlayerTurn || '';
    doc.topDisCard = toId(game.topDisCard) || undefined;
    doc.disCards = toIdArray(game.disCards);
    doc.drawnCard = toId(game.drawnCard) || undefined;
    doc.maxPlayers = game.maxPlayers ?? 6;
    doc.round = game.round ?? 1;
    doc.lastTurnSummary = game.lastTurnSummary || [];

    // Explicitly clear refs when the app sets them to null/undefined
    if (game.drawnCard == null) {
      doc.drawnCard = undefined;
      doc.set('drawnCard', undefined);
    }
    if (game.topDisCard == null) {
      doc.topDisCard = undefined;
    }

    await doc.save();
    return game;
  };

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  const deleteById = async (id) => {
    await Game.findByIdAndDelete(id);
  };

  /**
   * @returns {Promise<number>}
   */
  const countStarted = async () => {
    return Game.countDocuments({ hasStarted: true });
  };

  /**
   * @returns {Promise<void>}
   */
  const deleteAll = async () => {
    await Game.deleteMany({});
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
