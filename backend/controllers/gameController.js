const { getDb } = require('../db');
const gameService = require('../services/gameService');
const generateToken = require('../utils/jwt');

/**
 * Dev helper: wipe games and players.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const resetDB = async (req, res) => {
  try {
    const { games, players } = getDb();
    await games.deleteAll();
    await players.deleteAll();
    res.status(200).json({ message: 'Database Reset' });
  } catch {
    res.status(500).json({ error: 'Failed to reset Database' });
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const createGame = async (req, res) => {
  try {
    const newGame = await gameService.createGame();
    res.status(201).json({ message: 'Created game', gameId: newGame.id });
  } catch (error) {
    res.status(500).json('Failed to create game' + error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const joinGame = async (req, res) => {
  try {
    const { games } = getDb();
    const { gameId } = req.params;
    const { userName } = req.body;
    const game = await games.findById(gameId);
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
    res.status(500).json('Failed to add player' + error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const startGame = async (req, res) => {
  try {
    const { games } = getDb();
    const { gameId } = req.params;
    const { player } = req;
    const game = await games.findById(gameId, { players: true });
    if (player.username !== game.players[0].username)
      return res
        .status(401)
        .json({ error: 'Only player 1 can start the game.' });

    if (game.players.length < 2)
      return res.status(401).json({ error: 'Need at least 2 players...' });

    game.hasStarted = true;
    game.curPlayerTurn = player.username;
    await gameService.dealCards(game);
    await games.save(game);
    res.json({ message: 'Game started & Cards Dealt' });
  } catch (error) {
    res.status(500).json('Failed to start game' + error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const endTurn = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { player } = req;
    await gameService.incrementCurPlayerTurn(gameId, player);
    res.status(201).json({ message: 'Turn ended...' });
  } catch (error) {
    res.status(500).json('Failed to end turn' + error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const fetchGame = async (req, res) => {
  try {
    const { games } = getDb();
    const { gameId } = req.params;

    const game = await games.findById(gameId, {
      players: true,
      topDisCard: true,
      omit: ['drawnCard', 'disCards', 'deck'],
    });

    if (!game) {
      return res.status(400).json({ error: 'Game not found' });
    }
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json('Failed to fetch game: ' + error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const fetchCards = async (req, res) => {
  try {
    const { players } = getDb();
    const { gameId } = req.params;
    const cardIndexes = req.get('cardIndexes');
    const { player } = req;
    const targetPlayerName = req.get('targetPlayerName');
    let revealedCards = [];
    if (player.hasViewedCards)
      return res.status(401).json({ error: 'Already viewed card once...' });

    if (targetPlayerName) {
      revealedCards = await gameService.revealCards(
        gameId,
        cardIndexes,
        targetPlayerName,
        player.username
      );
      player.hasViewedCards = true;
      await players.save(player);
    } else if (!player.initialCardsRevealed) {
      console.log('Initial cards!');
      revealedCards = await gameService.revealCards(
        gameId,
        cardIndexes,
        player.username
      );
      player.initialCardsRevealed = true;
      await players.save(player);
    }

    res.status(201).json(revealedCards);
  } catch (error) {
    res.status(500).json('Failed to fetch cards' + error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const drawCard = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { player } = req;
    const drawnCard = await gameService.drawCard(gameId, player);
    res.status(201).json(drawnCard);
  } catch (error) {
    res.status(500).json('Failed to draw card: ' + error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const disCard = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { player } = req;
    await gameService.disCard(gameId, player);
    res.status(201).json({ message: 'Card discarded...' });
  } catch (error) {
    res.status(500).json('Failed to draw card: ' + error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const swapCards = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { player } = req;
    const cardIndex = req.get('cardIndex');
    const playerNames = req.get('playerNames');
    const cardIndexes = req.get('cardIndexes');

    if (playerNames && cardIndexes) {
      await gameService.swapCards(
        gameId,
        player,
        null,
        playerNames,
        cardIndexes
      );
    } else {
      await gameService.swapCards(gameId, player, cardIndex, null, null);
    }
    res.status(201).json({ message: 'Cards swapped...' });
  } catch (error) {
    res.status(500).json('Failed to draw card: ' + error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const numberOfActiveGames = async (req, res) => {
  try {
    const { games } = getDb();
    const count = await games.countStarted();
    res.status(201).json(count);
  } catch (error) {
    res.status(500).json('Failed to find number of games: ' + error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const numberOfPlayers = async (req, res) => {
  try {
    const { players } = getDb();
    const count = await players.count();
    res.status(201).json(count);
  } catch (error) {
    res.status(500).json('Failed to find number of players: ' + error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const fetchDeckCount = async (req, res) => {
  try {
    const { gameId } = req.params;
    const DeckCount = await gameService.deckCount(gameId);
    res.status(201).json(DeckCount);
  } catch (error) {
    res.status(500).json('Failed to find number of cards in deck: ' + error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const finalRound = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { player } = req;
    await gameService.finalRoundFlags(gameId, player);
    res.status(201).json({ message: 'Final round triggered...' });
  } catch (error) {
    res.status(500).json('Failed to trigger final round... ' + error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const endGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    await gameService.deleteGameAndPlayers(gameId);
    res.status(201).json({ message: 'Game & its Players Deleted...' });
  } catch (error) {
    res.status(500).json('Failed to delete game and players... ' + error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const finalCards = async (req, res) => {
  try {
    const { games } = getDb();
    const { gameId } = req.params;
    const game = await games.findById(gameId, { players: true });

    if (!game.scoreScreen)
      return res
        .status(401)
        .json({ error: 'Cannot reveal final cards before score screen...' });

    const revealedCards = [];
    for (let i = 0; i < game.players.length; i++) {
      revealedCards[i] = await gameService.revealCards(
        gameId,
        '1,1,1,1',
        game.players[i].username
      );
    }

    res.status(201).json(revealedCards);
  } catch (error) {
    res.status(500).json('Failed to fetch cards' + error);
  }
};

module.exports = {
  createGame,
  joinGame,
  startGame,
  fetchGame,
  fetchCards,
  drawCard,
  swapCards,
  disCard,
  endTurn,
  numberOfActiveGames,
  numberOfPlayers,
  fetchDeckCount,
  finalRound,
  resetDB,
  endGame,
  finalCards,
};
