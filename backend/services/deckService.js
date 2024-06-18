const Card = require('../models/card');

const generateRandomDeck = async () => {
  try {
    const cards = await Card.find({});
    return shuffleDeck(cards);
  } catch {
    console.error('Error generating random deck:', error);
  }
};

const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

module.exports = {
  generateRandomDeck,
  shuffleDeck,
};
