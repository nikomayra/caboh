require('dotenv').config();
const path = require('path');

const { PORT } = process.env;

const MONGODB_URI = process.env.MONGODB_URI;
const DB_DRIVER = (process.env.DB_DRIVER || 'sqlite').toLowerCase();
const SQLITE_PATH =
  process.env.SQLITE_PATH || path.join(__dirname, '..', 'data', 'caboh.sqlite');

module.exports = {
  MONGODB_URI,
  PORT,
  DB_DRIVER,
  SQLITE_PATH,
};
