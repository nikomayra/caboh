const Player = require('../models/player');
const Game = require('../models/game');
const Card = require('../models/card');

const updateHand = async (req, res) => {
  try {
    const { playerID, cardIDs } = req.body; // cardIDs should be an array of card IDs
    const player = await Player.findById(playerID);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    player.hand = cardIDs;
    await player.save();
    res.status(200).json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hand' });
  }
};

// Add other player-related controllers here

module.exports = {
  updateHand,
};
