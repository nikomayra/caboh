const Game = require('../models/game');
const Player = require('../models/player');
const Card = require('../models/card');
const deckService = require('./deckService');

const createGame = async () => {
  const newDeck = await deckService.generateRandomDeck();
  const newGame = new Game({
    deck: newDeck,
  });
  const savedNewGame = await newGame.save();
  //console.log('newGame created & saved to DB...');
  return savedNewGame;
};

const addPlayer = async (gameId, username) => {
  const game = await Game.findById(gameId);
  const newPlayer = new Player({ gameId, username });
  await newPlayer.save();
  game.players.push(newPlayer._id);
  await game.save();
  return newPlayer;
};

module.exports = {
  createGame,
  addPlayer,
};
