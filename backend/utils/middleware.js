const logger = require('./logger');
const { getDb } = require('../db');
const jwt = require('jsonwebtoken');

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method);
  logger.info('Path:  ', request.path);
  logger.info('Body:  ', request.body);
  logger.info('---');
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  if (
    error.name === 'MongoServerError' &&
    error.message.includes('E11000 duplicate key error')
  ) {
    return response
      .status(400)
      .json({ error: 'expected `username` to be unique' });
  }
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' });
  }
  if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired',
    });
  }

  next(error);
};

/**
 * Resolve the authenticated player for a game route and attach to req.player.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const playerExtractor = async (req, res, next) => {
  const { games } = getDb();
  const { gameId } = req.params;
  const authHeader = req.get('authorization');
  if (!authHeader) return res.status(401).json({ error: 'token missimg' });

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.SECRET);
  const username = decoded.username;
  if (!token) return res.status(401).json({ error: 'token missimg' });
  if (!username) return res.status(401).json({ error: 'token invalid' });

  const game = await games.findById(gameId, { players: true, hands: true });
  if (!game) return res.status(401).json({ error: 'game not found' });
  const player = game.players.find((p) => p.username === username);
  if (!player) return res.status(401).json({ error: 'player not found' });
  req.player = player;
  next();
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  playerExtractor,
};
