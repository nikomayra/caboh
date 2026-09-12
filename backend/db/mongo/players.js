const Player = require('../../models/player');
const { toId, toIdArray, toPlain } = require('../helpers');

/**
 * @returns {{ create: Function, save: Function, deleteManyByIds: Function, count: Function, deleteAll: Function }}
 */
const createPlayersRepo = () => {
  /**
   * @param {{ username: string, gameId: string, hand?: unknown[] }} data
   * @returns {Promise<object>}
   */
  const create = async (data) => {
    const player = new Player({
      username: data.username,
      gameId: toId(data.gameId),
      hand: toIdArray(data.hand || []),
    });
    const saved = await player.save();
    return toPlain(saved);
  };

  /**
   * Persist a mutated player plain object.
   * @param {object} player
   * @returns {Promise<object>}
   */
  const save = async (player) => {
    const doc = await Player.findById(player.id);
    if (!doc) throw new Error('Player not found');

    doc.username = player.username;
    doc.gameId = toId(player.gameId);
    doc.hand = toIdArray(player.hand);
    doc.hasDrawnCard = Boolean(player.hasDrawnCard);
    doc.hasSwappedCards = Boolean(player.hasSwappedCards);
    doc.hasViewedCards = Boolean(player.hasViewedCards);
    doc.initialCardsRevealed = Boolean(player.initialCardsRevealed);

    await doc.save();
    return player;
  };

  /**
   * @param {string[]} ids
   * @returns {Promise<void>}
   */
  const deleteManyByIds = async (ids) => {
    if (!ids || ids.length === 0) return;
    await Player.deleteMany({ _id: { $in: ids.map(toId) } });
  };

  /**
   * @returns {Promise<number>}
   */
  const count = async () => {
    return Player.countDocuments({});
  };

  /**
   * @returns {Promise<void>}
   */
  const deleteAll = async () => {
    await Player.deleteMany({});
  };

  return {
    create,
    save,
    deleteManyByIds,
    count,
    deleteAll,
  };
};

module.exports = { createPlayersRepo };
