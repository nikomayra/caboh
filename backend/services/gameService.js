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

const findGame = async (gameId, pops) => {
  try {
    if (pops.length <= 0) throw new Error('pops is required');
    let game = null;
    switch (pops) {
      case 'players':
        game = await Game.findById(gameId).populate('players');
        break;
      case 'deck':
        game = await Game.findById(gameId).populate('deck');
        break;
      case 'hand':
        game = await Game.findById(gameId).populate('hand');
        break;
      case 'hand-players':
        game = await Game.findById(gameId).populate({
          path: 'players',
          populate: {
            path: 'hand',
            model: 'Card',
          },
        });
        break;
      case 'none':
        game = await Game.findById(gameId);
        break;
      case 'all':
        game = await Game.findById(gameId).populate('players').populate('deck');
        break;
      default:
        throw new Error('pops should be players, deck, none, or all');
    }
    if (game === null) throw new Error('Game not found');
    return game;
  } catch (error) {
    console.log('Error finding game: ', error);
    throw error;
  }
};

const dealCards = async (game) => {
  const players = game.players;
  //console.log('players: ' + players);
  const playerPromises = players.map(async (player) => {
    let drawnHand = game.deck.splice(0, 4);
    player.hand = player.hand.concat(drawnHand);
    await player.save();
  });
  //console.log('players (after): ' + players);
  await Promise.all(playerPromises);
};

const playerCount = async (gameId) => {
  //console.log('playerCount');
  const game = await Game.findById(gameId);
  //console.log(game);
  return game.players.length;
};

const incrementCurPlayerTurn = async (gameId, username) => {
  try {
    const game = await Game.findById(gameId).populate('players');

    if (!game) {
      throw new Error('Game not found');
    }
    //console.log('incrementCurPlayerTurn');
    const curPlayerIndex = await findPlayerIndexByUsername(gameId, username);
    const pCount = await playerCount(gameId);
    //console.log('curPlayerIndex ' + curPlayerIndex);
    //console.log('pCount ' + pCount);
    if (curPlayerIndex === pCount - 1) {
      //if its the last player we need to go back to 0
      game.curPlayerTurn = game.players[0].username;
    } else {
      //console.log('curPlayerIndex ' + curPlayerIndex);
      game.curPlayerTurn = game.players[curPlayerIndex + 1].username;
    }
    //console.log('game.curPlayerTurn (after) ' + game.curPlayerTurn);
    await game.save();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const findPlayerIdByUsername = async (gameId, username) => {
  try {
    // Find the game by ID and populate the players
    const game = await Game.findById(gameId).populate('players');

    if (!game) {
      throw new Error('Game not found');
    }

    // Find the player with the given username
    const player = game.players.find((player) => player.username === username);

    if (!player) {
      throw new Error('Player not found in the game');
    }

    // Return the player's ID
    return player._id;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to find player');
  }
};

const findPlayerIndexByUsername = async (gameId, username) => {
  try {
    // Find the game by ID and populate the players
    const game = await Game.findById(gameId).populate('players');

    if (!game) {
      throw new Error('Game not found');
    }

    // Find the player with the given username
    const playerIndex = game.players.findIndex(
      (player) => player.username === username
    );

    if (playerIndex === -1) {
      throw new Error('Player index not found in the game');
    }

    // Return the player's ID
    return playerIndex;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const revealCards = async (gameId, cardIndexes, username) => {
  let revealedCards = [{}];
  const cardIndexesNoCommas = cardIndexes.replace(/,/g, '');
  const cardIndexesToArray = Array.from(cardIndexesNoCommas);
  const game = await findGame(gameId, 'hand-players');
  const playerIndex = await findPlayerIndexByUsername(gameId, username);
  for (let i = 0; i < 4; i++) {
    if (cardIndexesToArray[i] === '1') {
      revealedCards[i] = {
        suit: game.players[playerIndex].hand[i].suit,
        value: game.players[playerIndex].hand[i].value,
      };
    } else {
      revealedCards[i] = {
        suit: 'unknown',
        value: 'unknown',
      };
    }
  }

  return revealedCards;
};

module.exports = {
  createGame,
  findGame,
  addPlayer,
  dealCards,
  revealCards,
  findPlayerIdByUsername,
  findPlayerIndexByUsername,
  playerCount,
  incrementCurPlayerTurn,
};
