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
  const playerPromises = players.map(async (player) => {
    let drawnHand = game.deck.splice(0, 4);
    player.hand = player.hand.concat(drawnHand);
    await player.save();
  });
  await Promise.all(playerPromises);
};

const playerCount = async (gameId) => {
  const game = await Game.findById(gameId);
  return game.players.length;
};

const deckCount = async (gameId) => {
  const game = await Game.findById(gameId);
  return game.deck.length;
};

const incrementCurPlayerTurn = async (gameId, player) => {
  try {
    const game = await Game.findById(gameId).populate('players');

    if (!game) {
      throw new Error('Game not found');
    }
    const curPlayerIndex = game.players.findIndex(
      (p) => p.username === player.username
    );
    const pCount = await playerCount(gameId);
    if (curPlayerIndex === pCount - 1) {
      game.curPlayerTurn = game.players[0].username;
      game.round = game.round + 1;
    } else {
      game.curPlayerTurn = game.players[curPlayerIndex + 1].username;
    }
    if (!player.hasDrawnCard || game.drawnCard !== undefined)
      throw new Error('Cannot end turn without drawing card and discarding...');
    player.hasDrawnCard = false;
    player.hasSwappedCards = false;
    player.hasViewedCards = false;
    await player.save();
    await game.save();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const revealCards = async (gameId, cardIndexes, username) => {
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
  let revealedCards = [];
  for (let i = 0; i < 4; i++) {
    if (cardIndexesToArray[i] === '1') {
      revealedCards.push({
        index: i,
        suit: game.players[playerIndex].hand[i].suit,
        value: game.players[playerIndex].hand[i].value,
      });
    }
  }

  return revealedCards;
};

const drawCard = async (gameId, player) => {
  try {
    const game = await Game.findById(gameId)
      .populate('deck')
      .populate('disCards');
    if (!game) throw new Error('Game not found');
    if (player.username !== game.curPlayerTurn)
      throw new Error('Not your turn!');
    if (player.hasDrawnCard) throw new Error('Already drew card!');

    if (game.deck.length === 0) {
      const discardPileMinusTop = game.disCards.slice(0, -1);
      const topOfDiscardPile = game.disCards.slice(-1);

      game.disCards = topOfDiscardPile;
      const shuffledDiscardPileMinusTop =
        deckService.shuffleDeck(discardPileMinusTop);

      game.deck.push(...shuffledDiscardPileMinusTop);
    }

    const card = game.deck.pop();
    game.drawnCard = card;
    await game.save();

    player.hasDrawnCard = true;
    await player.save();

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

const swapCards = async (
  gameId,
  player,
  cardIndex,
  playerNames,
  cardIndexes
) => {
  try {
    const game = await Game.findById(gameId).populate({
      path: 'players',
      populate: {
        path: 'hand',
        model: 'Card',
      },
    });

    if (!game) throw new Error('Game not found');
    if (player.username !== game.curPlayerTurn)
      throw new Error('Not your turn!');
    if (game.drawnCard === undefined)
      throw new Error('Nothing to swap (no drawnCard)...');
    if (player.hasSwappedCards)
      throw new Error('Already swapped cards once...');

    if (playerNames && cardIndexes) {
      const playerNamesArray = playerNames.split(',');
      const cardIndexesArray = cardIndexes
        .split(',')
        .map((idx) => parseInt(idx.trim(), 10));

      if (cardIndexesArray.length !== 2 || playerNamesArray.length !== 2)
        throw new Error('Invalid input for JQ swap');

      console.log('playerNamesArray: ' + playerNamesArray);
      console.log('cardIndexesArray: ' + cardIndexesArray);

      const [player1Name, player2Name] = playerNamesArray;
      const [cardIndex1, cardIndex2] = cardIndexesArray;
      console.log(
        'player1Name, player2Name: ' + player1Name + ', ' + player2Name
      );
      console.log('cardIndex1, cardIndex2: ' + cardIndex1 + ', ' + cardIndex2);

      const player1 = game.players.find((p) => p.username === player1Name);
      const player2 = game.players.find((p) => p.username === player2Name);
      console.log('player1: ' + player1);
      console.log('player2: ' + player2);

      if (!player1 || !player2) throw new Error('Player not found');

      const card1ToSwap = player1.hand[cardIndex1];
      const card2ToSwap = player2.hand[cardIndex2];
      console.log('card1ToSwap: ' + card1ToSwap);
      console.log('card2ToSwap: ' + card2ToSwap);

      player1.hand.set(cardIndex1, card2ToSwap);
      player2.hand.set(cardIndex2, card1ToSwap);

      await player1.save();
      await player2.save();
    } else {
      const cardToSwap = player.hand[cardIndex]; // temp holder
      player.hand[cardIndex] = game.drawnCard; // hand card becomes drawnCard
      game.drawnCard = cardToSwap; //drawnCard becomes handcard from temp holder
      player.hasSwappedCards = true;
      await player.save();
    }

    await game.save();
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
  deckCount,
  incrementCurPlayerTurn,
};
