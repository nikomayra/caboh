const config = require('../config/config');
const { createSqliteRepos } = require('./sqlite');
const { createMongoRepos } = require('./mongo');

let repos = null;

/**
 * Initialize repositories for the configured DB_DRIVER.
 * Safe to call more than once; subsequent calls return the existing instance.
 * @returns {{ cards: object, games: object, players: object }}
 */
const init = () => {
  if (repos) return repos;

  if (config.DB_DRIVER === 'mongo') {
    repos = createMongoRepos();
  } else {
    repos = createSqliteRepos();
  }

  return repos;
};

/**
 * @returns {{ cards: object, games: object, players: object }}
 */
const getDb = () => {
  if (!repos) {
    return init();
  }
  return repos;
};

module.exports = {
  init,
  getDb,
};
