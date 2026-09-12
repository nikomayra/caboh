const { getDb } = require('../db');

/**
 * Load all cards and return them in a shuffled order (ids preserved on each card).
 * @returns {Promise<object[]>}
 */
const generateRandomDeck = async () => {
  try {
    const { cards } = getDb();
    const allCards = await cards.findAll();
    return shuffleDeck(allCards);
  } catch (error) {
    console.error('Error generating random deck:', error);
    throw error;
  }
};

/**
 * Fisher–Yates shuffle (mutates and returns the same array).
 * @param {unknown[]} deck
 * @returns {unknown[]}
 */
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
