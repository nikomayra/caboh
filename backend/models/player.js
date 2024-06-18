const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 3,
  },
  hand: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card', // Reference to the Card schema
    },
  ],
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
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
