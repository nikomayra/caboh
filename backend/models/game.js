const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  deck: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
    },
  ],
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    },
  ],
  curPlayerTurn: {
    //username
    type: String,
    default: '',
  },
  hasStarted: {
    type: Boolean,
    default: false,
  },
  maxPlayers: {
    type: Number,
    default: 5,
  },
});

gameSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Game', gameSchema);
