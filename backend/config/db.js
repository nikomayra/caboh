const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');
const { init } = require('../db');
const { seedCardsIfEmpty } = require('../db/mongo/seed');

/**
 * Connect to MongoDB or open SQLite based on DB_DRIVER, then initialize repositories.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  if (config.DB_DRIVER === 'mongo') {
    mongoose.set('strictQuery', false);

    try {
      logger.info('connecting to', config.MONGODB_URI);
      await mongoose.connect(config.MONGODB_URI);
      logger.info('connected to MongoDB');
      await seedCardsIfEmpty();
    } catch (error) {
      logger.error('error connection to MongoDB:', error.message);
      throw error;
    }
  } else {
    logger.info('using SQLite driver');
  }

  init();
};

module.exports = connectDB;
