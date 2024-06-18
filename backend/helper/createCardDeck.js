const Card = require('../models/card');
const connectDB = require('../config/db');

const main = async () => {
  connectDB();
  await createCardDeckinDB();
  console.log('Created Card Deck');
};

const createCardDeckinDB = async () => {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const values = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
    'A',
  ];
  for (let suit of suits) {
    for (let value of values) {
      const card = new Card({ suit, value });
      await card.save();
    }
  }
};

module.exports = { main };
