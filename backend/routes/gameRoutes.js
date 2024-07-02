const express = require('express');
const gameController = require('../controllers/gameController');
const router = express.Router();
const { playerExtractor } = require('../utils/middleware');

router.get('/api/games/reset', gameController.resetDB); //Delete before release...

router.get('/api/games/number-of-games', gameController.numberOfActiveGames);
router.get('/api/games/number-of-players', gameController.numberOfPlayers);
router.get(
  '/api/games/fetch-deck-count/:gameId',
  gameController.fetchDeckCount
);
router.post('/api/games/create-game', gameController.createGame);
router.post('/api/games/join-game/:gameId', gameController.joinGame);
router.get('/api/games/:gameId', gameController.fetchGame);

//Token verified routes
router.post(
  '/api/games/start-game/:gameId',
  playerExtractor,
  gameController.startGame
);
router.get(
  '/api/games/fetch-cards/:gameId',
  playerExtractor,
  gameController.fetchCards
);
router.post(
  '/api/games/end-turn/:gameId',
  playerExtractor,
  gameController.endTurn
);
router.post(
  '/api/games/final-round/:gameId',
  playerExtractor,
  gameController.finalRound
);
router.post(
  '/api/games/draw-card/:gameId',
  playerExtractor,
  gameController.drawCard
);
router.post(
  '/api/games/dis-card/:gameId',
  playerExtractor,
  gameController.disCard
);
router.post(
  '/api/games/swap-cards/:gameId',
  playerExtractor,
  gameController.swapCards
);
router.post(
  '/api/games/end-game/:gameId',
  playerExtractor,
  gameController.endGame
);

module.exports = router;
