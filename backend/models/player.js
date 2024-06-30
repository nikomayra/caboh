const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 10,
  },
  hand: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
    },
  ],
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
  },
  hasDrawnCard: {
    type: Boolean,
    default: false,
  },
  hasSwappedCards: {
    type: Boolean,
    default: false,
  },
  hasViewedCards: {
    type: Boolean,
    default: false,
  },
});

// Custom validator to check uniqueness within the same game
playerSchema.path('username').validate(async function (value) {
  const existingPlayer = await mongoose.model('Player').findOne({
    _id: { $ne: this._id }, // Exclude the current player
    gameId: this.gameId,
    username: value,
  });
  return !existingPlayer; // Return true if no duplicate username found
}, 'Player username must be unique within the same game.');

playerSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Player', playerSchema);
