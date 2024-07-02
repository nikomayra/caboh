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

const deleteGameAndPlayers = async (gameId) => {
  try {
    // Introduce a delay before deleting the game and players
    setTimeout(async () => {
      try {
        const game = await Game.findById(gameId).populate('players');

        if (game) {
          // Delete all players associated with the game
          await Player.deleteMany({ _id: { $in: game.players } });

          // Delete the game itself
          await Game.findByIdAndDelete(gameId);
          console.log('Game and associated players deleted successfully.');
        }
      } catch (error) {
        console.error('Error deleting game and players:', error);
      }
    }, 60000); // 1 minute delay (adjust as needed)
  } catch (error) {
    console.error('Error handling game end:', error);
  }
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

    const lastPlayersName =
      curPlayerIndex === 0
        ? game.players[pCount - 1].username
        : game.players[curPlayerIndex - 1].username;

    let cabohPlayerCheck = false;
    if (game.lastPlayerTurn === lastPlayersName && game.finalRound)
      cabohPlayerCheck = true;

    //You can end your turn without doing anything when you call Caboh - only pass...
    if (!cabohPlayerCheck) {
      if (!player.hasDrawnCard || game.drawnCard !== undefined)
        throw new Error(
          'Cannot end turn without drawing card and discarding...'
        );
    }

    player.hasDrawnCard = false;
    player.hasSwappedCards = false;
    player.hasViewedCards = false;
    await player.save();

    if (game.finalRound && game.curPlayerTurn === game.lastPlayerTurn) {
      game.finalScores = await finalScores(gameId);
      game.scoreScreen = true;
      await game.save();
    } else {
      if (curPlayerIndex === pCount - 1) {
        game.curPlayerTurn = game.players[0].username;
        game.round = game.round + 1;
      } else {
        game.curPlayerTurn = game.players[curPlayerIndex + 1].username;
      }
      game.scoreScreen = false;
      await game.save();
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const finalScores = async (gameId) => {
  try {
    const game = await Game.findById(gameId).populate({
      path: 'players',
      populate: {
        path: 'hand',
        model: 'Card',
      },
    });

    let scores = [];
    for (let i = 0; i < game.players.length; i++) {
      const player = game.players[i];
      const playerScore = player.hand.reduce(
        (total, card) => total + cardValue(card),
        0
      );
      scores.push(playerScore);
    }
    return scores;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const cardValue = (card) => {
  switch (card.value) {
    case 'K':
      return card.suit === 'Hearts' || card.suit === 'Diamonds' ? 0 : 13;
    case 'A':
      return 1;
    case 'Q':
      return 12;
    case 'J':
      return 11;
    default:
      return parseInt(card.value, 10);
  }
};

const revealCards = async (gameId, cardIndexes, username, myname = '') => {
  const cardIndexesNoCommas = cardIndexes.replace(/,/g, '');
  const cardIndexesToArray = Array.from(cardIndexesNoCommas);
  const game = await Game.findById(gameId).populate({
    path: 'players',
    populate: {
      path: 'hand',
      model: 'Card',
    },
  });
  //console.log('game: ' + game);
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

  let action = '';
  if (revealedCards.length === 1) {
    // Ignore the initial card reveal at start of game
    if (username === myname) {
      action =
        myname +
        ' viewed card ' +
        revealedCards[0].index +
        ' in their own hand.\n';
    } else {
      action =
        myname +
        ' viewed card ' +
        revealedCards[0].index +
        ' in ' +
        username +
        "'s hand.\n";
    }
    game.lastTurnSummary = game.lastTurnSummary.concat(action);
  }

  await game.save();

  return revealedCards;
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

    let action = '';
    if (playerNames && cardIndexes) {
      const playerNamesArray = playerNames.split(',');
      const cardIndexesArray = cardIndexes
        .split(',')
        .map((idx) => parseInt(idx.trim(), 10));

      if (cardIndexesArray.length !== 2 || playerNamesArray.length !== 2)
        throw new Error('Invalid input for JQ swap');

      const [player1Name, player2Name] = playerNamesArray;
      const [cardIndex1, cardIndex2] = cardIndexesArray;

      action =
        player.username +
        ' swapped ' +
        player1Name +
        "'s card " +
        cardIndex1 +
        ' with ' +
        player2Name +
        "'s card " +
        cardIndex2 +
        '.';

      const player1 = game.players.find((p) => p.username === player1Name);
      const player2 = game.players.find((p) => p.username === player2Name);

      if (!player1 || !player2) throw new Error('Player not found');

      const card1ToSwap = player1.hand[cardIndex1];
      const card2ToSwap = player2.hand[cardIndex2];

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
      action =
        player.username +
        ' swapped their card ' +
        cardIndex +
        ' with the card they drew.';
    }

    game.lastTurnSummary = game.lastTurnSummary.concat(action);
    await game.save();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const finalRoundFlags = async (gameId, player) => {
  const game = await Game.findById(gameId).populate('players');

  if (!game) throw new Error('Game not found');
  if (player.hasDrawnCard)
    throw new Error(
      'Calling Caboh counts as a turn, you cannot have drawn a card...'
    );
  if (game.finalRound) throw new Error('Caboh has already been called...');

  const curPlayerIndex = game.players.findIndex(
    (p) => p.username === player.username
  );
  //console.log('curPlayerIndex: ' + curPlayerIndex);
  const pCount = await playerCount(gameId);
  //console.log('pCount: ' + pCount);
  if (curPlayerIndex === 0) {
    //if first player
    game.lastPlayerTurn = game.players[pCount - 1].username; //last player turn will be the previous player, aka last player
  } else {
    //if other player
    game.lastPlayerTurn = game.players[curPlayerIndex - 1].username; //last player turn will be the previous player
  }
  //console.log('game.lastPlayerTurn: ' + game.lastPlayerTurn);
  game.finalRound = true;
  await game.save();
};

module.exports = {
  createGame,
  deleteGameAndPlayers,
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
  finalRoundFlags,
};
