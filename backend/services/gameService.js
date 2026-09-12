const { getDb } = require('../db');
const { toId } = require('../db/helpers');
const deckService = require('./deckService');

/**
 * Create a new game with a shuffled deck of card references.
 * @returns {Promise<object>}
 */
const createGame = async () => {
  const { games } = getDb();
  const newDeck = await deckService.generateRandomDeck();
  const savedNewGame = await games.create({ deck: newDeck });
  return savedNewGame;
};

/**
 * Schedule deletion of a game and its players after a short delay.
 * @param {string} gameId
 * @returns {Promise<void>}
 */
const deleteGameAndPlayers = async (gameId) => {
  try {
    setTimeout(async () => {
      try {
        const { games, players } = getDb();
        const game = await games.findById(gameId, { players: true });

        if (game) {
          await players.deleteManyByIds(game.players.map((p) => toId(p)));
          await games.deleteById(gameId);
          console.log('Game and associated players deleted successfully.');
        }
      } catch (error) {
        console.error('Error deleting game and players:', error);
      }
    }, 60000);
  } catch (error) {
    console.error('Error handling game end:', error);
  }
};

/**
 * Add a player to a game and persist the updated player list.
 * @param {string} gameId
 * @param {string} username
 * @returns {Promise<object>}
 */
const addPlayer = async (gameId, username) => {
  const { games, players } = getDb();
  const game = await games.findById(gameId);
  if (!game) throw new Error('Game not found');

  const newPlayer = await players.create({ gameId, username });
  game.players.push(newPlayer.id);
  await games.save(game);
  return newPlayer;
};

/**
 * Find a game with optional related data hydrated.
 * @param {string} gameId
 * @param {'players'|'deck'|'hand-players'|'deck-players'|'none'} pops
 * @returns {Promise<object>}
 */
const findGame = async (gameId, pops) => {
  try {
    if (!pops || pops.length <= 0) throw new Error('pops is required');
    const { games } = getDb();
    let options = {};

    switch (pops) {
      case 'players':
        options = { players: true };
        break;
      case 'deck':
        options = { deck: true };
        break;
      case 'hand-players':
        options = { players: true, hands: true };
        break;
      case 'deck-players':
        options = { players: true, deck: true };
        break;
      case 'none':
        options = {};
        break;
      default:
        throw new Error('pops should be players, deck, none, or all');
    }

    const game = await games.findById(gameId, options);
    if (game === null) throw new Error('Game not found');
    return game;
  } catch (error) {
    console.log('Error finding game: ', error);
    throw error;
  }
};

/**
 * Deal 4 cards from the game deck into each player's hand (mutates game.deck).
 * @param {object} game
 * @returns {Promise<void>}
 */
const dealCards = async (game) => {
  const { players } = getDb();
  const playerList = game.players;
  const playerPromises = playerList.map(async (player) => {
    const drawnHand = game.deck.splice(0, 4);
    player.hand = player.hand.concat(drawnHand);
    await players.save(player);
  });
  await Promise.all(playerPromises);
};

/**
 * @param {string} gameId
 * @returns {Promise<number>}
 */
const playerCount = async (gameId) => {
  const { games } = getDb();
  const game = await games.findById(gameId);
  return game.players.length;
};

/**
 * @param {string} gameId
 * @returns {Promise<number>}
 */
const deckCount = async (gameId) => {
  const { games } = getDb();
  const game = await games.findById(gameId);
  return game.deck.length;
};

/**
 * Draw the top card of the deck for the current player.
 * @param {string} gameId
 * @param {object} player
 * @returns {Promise<object>}
 */
const drawCard = async (gameId, player) => {
  try {
    const { games, players } = getDb();
    const game = await games.findById(gameId, { deck: true, disCards: true });
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
    await games.save(game);

    player.hasDrawnCard = true;
    await players.save(player);

    return card;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Discard the currently drawn card.
 * @param {string} gameId
 * @param {object} player
 * @returns {Promise<void>}
 */
const disCard = async (gameId, player) => {
  try {
    const { games } = getDb();
    const game = await games.findById(gameId);
    if (!game) throw new Error('Game not found');
    if (player.username !== game.curPlayerTurn)
      throw new Error('Not your turn!');

    if (game.drawnCard == null) throw new Error('Nothing to discard...');
    game.disCards.push(game.drawnCard);
    game.topDisCard = game.drawnCard;
    game.drawnCard = null;
    await games.save(game);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Advance turn to the next player, or finish the game after Caboh.
 * @param {string} gameId
 * @param {object} player
 * @returns {Promise<void>}
 */
const incrementCurPlayerTurn = async (gameId, player) => {
  try {
    const { games, players } = getDb();
    const game = await games.findById(gameId, { players: true });

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

    if (!cabohPlayerCheck) {
      if (!player.hasDrawnCard || game.drawnCard != null)
        throw new Error(
          'Cannot end turn without drawing card and discarding...'
        );
    }

    player.hasDrawnCard = false;
    player.hasSwappedCards = false;
    player.hasViewedCards = false;
    await players.save(player);

    if (game.finalRound && game.curPlayerTurn === game.lastPlayerTurn) {
      game.finalScores = await finalScores(gameId);
      game.scoreScreen = true;
      await games.save(game);
    } else {
      if (curPlayerIndex === pCount - 1) {
        game.curPlayerTurn = game.players[0].username;
        game.round = game.round + 1;
      } else {
        game.curPlayerTurn = game.players[curPlayerIndex + 1].username;
      }
      game.scoreScreen = false;
      await games.save(game);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * @param {string} gameId
 * @returns {Promise<number[]>}
 */
const finalScores = async (gameId) => {
  try {
    const { games } = getDb();
    const game = await games.findById(gameId, { players: true, hands: true });

    const scores = [];
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

/**
 * @param {{ suit: string, value: string }} card
 * @returns {number}
 */
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

/**
 * Reveal selected card indexes for a player and optionally log the action.
 * @param {string} gameId
 * @param {string} cardIndexes
 * @param {string} username
 * @param {string} [myname]
 * @returns {Promise<Array<{index: number, suit: string, value: string}>>}
 */
const revealCards = async (gameId, cardIndexes, username, myname = '') => {
  const { games } = getDb();
  const cardIndexesNoCommas = cardIndexes.replace(/,/g, '');
  const cardIndexesToArray = Array.from(cardIndexesNoCommas);
  const game = await games.findById(gameId, { players: true, hands: true });

  const playerIndex = game.players.findIndex(
    (player) => player.username === username
  );
  const revealedCards = [];
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
    if (username === myname) {
      action =
        myname +
        ' viewed card ' +
        (parseInt(revealedCards[0].index) + 1) +
        ' in their own hand.\n';
    } else {
      action =
        myname +
        ' viewed card ' +
        (parseInt(revealedCards[0].index) + 1) +
        ' in ' +
        username +
        "'s hand.\n";
    }
    game.lastTurnSummary = game.lastTurnSummary.concat(action);
  }

  await games.save(game);

  return revealedCards;
};

/**
 * Swap the drawn card with a hand card, or swap two players' cards (J/Q ability).
 * @param {string} gameId
 * @param {object} player
 * @param {string|number|null} cardIndex
 * @param {string|null} playerNames
 * @param {string|null} cardIndexes
 * @returns {Promise<void>}
 */
const swapCards = async (
  gameId,
  player,
  cardIndex,
  playerNames,
  cardIndexes
) => {
  try {
    const { games, players } = getDb();
    const game = await games.findById(gameId, { players: true, hands: true });

    if (!game) throw new Error('Game not found');
    if (player.username !== game.curPlayerTurn)
      throw new Error('Not your turn!');
    if (game.drawnCard == null)
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
        (cardIndex1 + 1) +
        ' with ' +
        player2Name +
        "'s card " +
        (cardIndex2 + 1) +
        '.';

      const player1 = game.players.find((p) => p.username === player1Name);
      const player2 = game.players.find((p) => p.username === player2Name);

      if (!player1 || !player2) throw new Error('Player not found');

      const card1ToSwap = player1.hand[cardIndex1];
      const card2ToSwap = player2.hand[cardIndex2];

      player1.hand[cardIndex1] = card2ToSwap;
      player2.hand[cardIndex2] = card1ToSwap;

      await players.save(player1);
      await players.save(player2);
    } else {
      // Keep the middleware/controller player object in sync with DB player
      const dbPlayer = game.players.find((p) => p.id === player.id) || player;
      const cardToSwap = dbPlayer.hand[cardIndex];
      dbPlayer.hand[cardIndex] = game.drawnCard;
      game.drawnCard = cardToSwap;
      dbPlayer.hasSwappedCards = true;
      player.hasSwappedCards = true;
      player.hand = dbPlayer.hand;
      await players.save(dbPlayer);
      action =
        player.username +
        ' swapped their card ' +
        (parseInt(cardIndex) + 1) +
        ' with the card they drew.';
    }

    game.lastTurnSummary = game.lastTurnSummary.concat(action);
    await games.save(game);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Mark Caboh / final-round flags on the game.
 * @param {string} gameId
 * @param {object} player
 * @returns {Promise<void>}
 */
const finalRoundFlags = async (gameId, player) => {
  const { games } = getDb();
  const game = await games.findById(gameId, { players: true });

  if (!game) throw new Error('Game not found');
  if (player.hasDrawnCard)
    throw new Error(
      'Calling Caboh counts as a turn, you cannot have drawn a card...'
    );
  if (game.finalRound) throw new Error('Caboh has already been called...');

  const curPlayerIndex = game.players.findIndex(
    (p) => p.username === player.username
  );
  const pCount = await playerCount(gameId);
  if (curPlayerIndex === 0) {
    game.lastPlayerTurn = game.players[pCount - 1].username;
  } else {
    game.lastPlayerTurn = game.players[curPlayerIndex - 1].username;
  }
  game.finalRound = true;
  await games.save(game);
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
