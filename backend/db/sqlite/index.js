const { getConnection } = require('./connection');
const { migrate } = require('./schema');
const { seedCardsIfEmpty } = require('./seed');
const { createCardsRepo } = require('./cards');
const { createPlayersRepo } = require('./players');
const { createGamesRepo } = require('./games');

/**
 * Initialize SQLite schema/seed and return repository instances.
 * @returns {{ cards: object, games: object, players: object }}
 */
const createSqliteRepos = () => {
  const db = getConnection();
  migrate(db);
  seedCardsIfEmpty(db);

  const cards = createCardsRepo();
  const players = createPlayersRepo(cards);
  const games = createGamesRepo(cards, players);

  return { cards, games, players };
};

module.exports = { createSqliteRepos };
