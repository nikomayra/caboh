const express = require('express');
const cors = require('cors');
const config = require('./config/config');
require('express-async-errors');

const app = express();
const connectDB = require('./config/db');
const gameRouter = require('./routes/gameRoutes');
const middleware = require('./utils/middleware');

// Connect to DB
connectDB();
app.use(cors());
app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use(gameRouter);

// Catch-all handler to serve index.html for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
