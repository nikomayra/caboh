const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

const connectDB = async () => {
  mongoose.set('strictQuery', false);

  try {
    logger.info('connecting to', config.MONGODB_URI);
    await mongoose.connect(config.MONGODB_URI);
    logger.info('connected to MongoDB');
  } catch (error) {
    logger.error('error connection to MongoDB:', error.message);
  }
};

module.exports = connectDB;
