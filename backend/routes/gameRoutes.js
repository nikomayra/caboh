const express = require('express');
const gameController = require('../controllers/gameController');
const router = express.Router();

router.get('/api/games/reset', gameController.resetDB); //Delete before release...

router.post('/api/games/create-game', gameController.createGame);
router.post('/api/games/join-game/:gameId', gameController.joinGame);
router.post('/api/games/start-game/:gameId', gameController.startGame);
router.get('/api/games/:gameId', gameController.fetchGame);

module.exports = router;
