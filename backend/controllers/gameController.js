const Game = require('../models/game');
const Player = require('../models/player');
const Card = require('../models/card');
const gameService = require('../services/gameService');
//const deckService = require('../services/deckService');
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
    res.status(500).json('Failed to create game' + error);
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
    res.status(500).json('Failed to add player' + error);
  }
};

const startGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { player } = req;
    const game = await Game.findById(gameId).populate('players');
    if (player.username !== game.players[0].username)
      return res
        .status(401)
        .json({ error: 'Only player 1 can start the game.' });

    if (game.players.length < 2)
      return res.status(401).json({ error: 'Need at least 2 players...' });

    game.hasStarted = true;
    game.curPlayerTurn = player.username;
    gameService.dealCards(game); //deal 4 cards to each player
    await game.save();
    res.json({ message: 'Game started & Cards Dealt' });
  } catch (error) {
    res.status(500).json('Failed to start game' + error);
  }
};

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

const fetchGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findById(gameId)
      .select('-drawnCard')
      .select('-disCards')
      .select('-deck')
      .populate('players')
      .populate('topDisCard');

    if (!game) {
      return res.status(400).json({ error: 'Game not found' });
    }
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json('Failed to fetch game: ' + error);
  }
};

const fetchCards = async (req, res) => {
  try {
    const { gameId } = req.params;
    const cardIndexes = req.get('cardIndexes');
    const { player } = req;
    const targetPlayerName = req.get('targetPlayerName');
    let revealedCards = null;
    if (player.hasViewedCards)
      return res.status(401).json({ error: 'Already viewed card once...' });

    if (targetPlayerName) {
      revealedCards = await gameService.revealCards(
        gameId,
        cardIndexes,
        targetPlayerName,
        player.username
      );
      player.hasViewedCards = true; // Player has done a view action (1 max per turn)
      player.save();
    } else if (!player.initialCardsRevealed) {
      // Initial card reveal
      revealedCards = await gameService.revealCards(
        gameId,
        cardIndexes,
        player.username
      );
      player.initialCardsRevealed = true;
      await player.save();
    }

    //console.log('revealedCards' + revealedCards);
    res.status(201).json(revealedCards);
  } catch (error) {
    res.status(500).json('Failed to fetch cards' + error);
  }
};

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

const swapCards = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { player } = req;
    const cardIndex = req.get('cardIndex');
    const playerNames = req.get('playerNames');
    const cardIndexes = req.get('cardIndexes');

    if (playerNames && cardIndexes) {
      /* console.log(
        'playerNames, cardIndexes' + playerNames + ', ' + cardIndexes
      ); */
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

const numberOfActiveGames = async (req, res) => {
  try {
    const gamesInDB = await Game.find({ hasStarted: true });
    res.status(201).json(gamesInDB.length);
  } catch (error) {
    res.status(500).json('Failed to find number of games: ' + error);
  }
};

const numberOfPlayers = async (req, res) => {
  try {
    const playersInDB = await Player.find({});
    res.status(201).json(playersInDB.length);
  } catch (error) {
    res.status(500).json('Failed to find number of players: ' + error);
  }
};

const fetchDeckCount = async (req, res) => {
  try {
    const { gameId } = req.params;
    const DeckCount = await gameService.deckCount(gameId);
    res.status(201).json(DeckCount);
  } catch (error) {
    res.status(500).json('Failed to find number of cards in deck: ' + error);
  }
};

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

const endGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    await gameService.deleteGameAndPlayers(gameId);
    res.status(201).json({ message: 'Game & its Players Deleted...' });
  } catch (error) {
    res.status(500).json('Failed to delete game and players... ' + error);
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
};
