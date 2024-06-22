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
      case 'hand-players':
        game = await Game.findById(gameId).populate({
          path: 'players',
          populate: {
            path: 'hand',
            model: 'Card',
          },
        });
        break;
      case 'deck-players':
        game = await Game.findById(gameId).populate('players').populate('deck');
        break;
      case 'none':
        game = await Game.findById(gameId);
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

const incrementCurPlayerTurn = async (gameId, player) => {
  try {
    const game = await Game.findById(gameId).populate('players');

    if (!game) {
      throw new Error('Game not found');
    }
    //console.log('incrementCurPlayerTurn');
    const curPlayerIndex = game.players.findIndex(
      (p) => p.username === player.username
    );
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
    //console.log('player' + player);
    if (!player.hasDrawnCard || game.drawnCard !== undefined)
      // || game.drawnCard !== undefined)
      throw new Error(
        'Cannot end turn without drawing card or with a card in-hand...'
      );
    player.hasDrawnCard = false;
    player.hasSwappedCards = false;
    await player.save();
    await game.save();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const revealCards = async (gameId, cardIndexes, username) => {
  let revealedCards = [{}];
  const cardIndexesNoCommas = cardIndexes.replace(/,/g, '');
  const cardIndexesToArray = Array.from(cardIndexesNoCommas);
  const game = await Game.findById(gameId).populate({
    path: 'players',
    populate: {
      path: 'hand',
      model: 'Card',
    },
  });
  const playerIndex = game.players.findIndex(
    (player) => player.username === username
  );
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

const drawCard = async (gameId, player) => {
  try {
    const game = await Game.findById(gameId).populate('deck');
    if (!game) throw new Error('Game not found');
    if (player.username !== game.curPlayerTurn)
      throw new Error('Not your turn!');

    if (player.hasDrawnCard) throw new Error('Already drew card!');
    if (game.deck.length === 0) {
      game.deck = game.disCards.slice(1, game.disCards.length);
      await game.save();
    }
    const card = game.deck.pop();
    game.drawnCard = card;
    await game.save();
    player.hasDrawnCard = true;
    player.save();
    return card;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const disCard = async (gameId, player) => {
  try {
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');
    if (player.username !== game.curPlayerTurn)
      throw new Error('Not your turn!');

    if (game.drawnCard === undefined) throw new Error('Nothing to discard...');
    game.disCards.push(game.drawnCard);
    game.topDisCard = game.drawnCard;
    game.drawnCard = undefined;
    // implment useAbility (game, player)
    await game.save();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const swapCards = async (gameId, player, cardIndex) => {
  try {
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');
    if (player.username !== game.curPlayerTurn)
      throw new Error('Not your turn!');
    if (game.drawnCard === undefined)
      throw new Error('Nothing to swap (no drawnCard)...');
    if (player.hasSwappedCards)
      throw new Error('Already swapped cards once...');

    const cardToSwap = player.hand[cardIndex]; // temp holder
    player.hand[cardIndex] = game.drawnCard; // hand card becomes drawnCard
    game.drawnCard = cardToSwap; //drawnCard becomes handcard from temp holder
    player.hasSwappedCards = true;
    await player.save();
    await game.save();
    return cardToSwap;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  createGame,
  findGame,
  addPlayer,
  dealCards,
  revealCards,
  drawCard,
  disCard,
  swapCards,
  playerCount,
  incrementCurPlayerTurn,
};
