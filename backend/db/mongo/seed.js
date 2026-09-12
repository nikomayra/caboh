const Card = require('../../models/card');
const { SUITS, VALUES } = require('../sqlite/seed');

/**
 * Seed the 52-card catalog in MongoDB when the cards collection is empty.
 * @returns {Promise<void>}
 */
const seedCardsIfEmpty = async () => {
  const count = await Card.countDocuments({});
  if (count > 0) return;

  for (const suit of SUITS) {
    for (const value of VALUES) {
      const card = new Card({ suit, value });
      await card.save();
    }
  }
};

module.exports = { seedCardsIfEmpty };
