const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  suit: {
    type: String,
    enum: ['Hearts', 'Diamonds', 'Clubs', 'Spades'],
    required: true,
  },
  value: {
    type: String,
    enum: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
    required: true,
  },
});

cardSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Card', cardSchema);
