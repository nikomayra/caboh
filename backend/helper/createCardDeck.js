const connectDB = require('../config/db');
const { seedCardsIfEmpty } = require('../db/mongo/seed');
const config = require('../config/config');

/**
 * One-off / CLI entrypoint to ensure the card catalog exists.
 */
const main = async () => {
  await connectDB();
  if (config.DB_DRIVER === 'sqlite') {
    console.log('SQLite seeds cards on connect; nothing else to do.');
  } else {
    await seedCardsIfEmpty();
    console.log('Created Card Deck');
  }
};

module.exports = { main };
