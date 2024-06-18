const Game = require('../models/game');
const Player = require('../models/player');
const Card = require('../models/card');
const gameService = require('../services/gameService');
const generateToken = require('../utils/jwt');
const jwt = require('jsonwebtoken');

//Dev function
const resetDB = async (req, res) => {
  try {
    await Game.deleteMany({});
    await Player.deleteMany({});
    res.status(200).json({ message: 'Database Reset' });
  } catch {
    res.status(500).json({ error: 'Failed to reset Database' });
  }
};

const createGame = async (req, res) => {
  try {
    const newGame = await gameService.createGame();
    res.status(201).json({ message: 'Created game', gameId: newGame.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game' });
  }
};

const joinGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userName } = req.body;
    const game = await Game.findById(gameId);
    if (!game || game.hasStarted) {
      return res
        .status(400)
        .json({ error: 'Game not found or already started' });
    }
    if (game.players.length >= game.maxPlayers) {
      return res.status(400).json({ error: 'Game is full' });
    }

    const newPlayer = await gameService.addPlayer(gameId, userName);
    const token = generateToken(userName);
    res.status(201).json({
      Player: newPlayer,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add player' });
  }
};

const startGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    console.log('gameId: ' + gameId);
    const token = req.get('authorization').split(' ')[1];
    console.log('token: ' + token);
    const game = await Game.findById(gameId).populate('players');
    if (!game) {
      return res.status(400).json({ error: 'Game not found' });
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    const username = decoded.username;
    console.log('decoded username: ' + username);
    console.log('game player at 0 pos username: ' + game.players[0].username);
    if (username !== game.players[0].username) {
      return res
        .status(401)
        .json({ error: 'Only player 1 can start the game.' });
    }

    game.hasStarted = true;
    await game.save();
    res.json({ message: 'Game started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start game' });
  }
};

const fetchGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findById(gameId)
      .populate('players')
      .populate('deck');

    if (!game) {
      return res.status(400).json({ error: 'Game not found' });
    }
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game' });
  }
};

module.exports = {
  createGame,
  joinGame,
  startGame,
  fetchGame,
  resetDB,
};
