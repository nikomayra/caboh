const { createCardsRepo } = require('./cards');
const { createPlayersRepo } = require('./players');
const { createGamesRepo } = require('./games');

/**
 * Create Mongo/Mongoose-backed repository instances.
 * @returns {{ cards: object, games: object, players: object }}
 */
const createMongoRepos = () => {
  const cards = createCardsRepo();
  const players = createPlayersRepo();
  const games = createGamesRepo();
  return { cards, games, players };
};

module.exports = { createMongoRepos };
