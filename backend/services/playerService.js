const Player = require('../models/player');

exports.updateHand = async (playerID, cardIDs) => {
  const player = await Player.findById(playerID);
  if (!player) throw new Error('Player not found');

  player.hand = cardIDs;
  await player.save();
  return player;
};
