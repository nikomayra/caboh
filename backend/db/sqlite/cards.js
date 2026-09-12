const { getConnection } = require('./connection');

/**
 * @returns {{ findAll: Function, findById: Function }}
 */
const createCardsRepo = () => {
  const db = getConnection();

  /**
   * @returns {Promise<Array<{id: string, suit: string, value: string}>>}
   */
  const findAll = async () => {
    return db.prepare('SELECT id, suit, value FROM cards').all();
  };

  /**
   * @param {string} id
   * @returns {Promise<{id: string, suit: string, value: string}|null>}
   */
  const findById = async (id) => {
    return db.prepare('SELECT id, suit, value FROM cards WHERE id = ?').get(id) || null;
  };

  /**
   * @param {string[]} ids
   * @returns {Map<string, {id: string, suit: string, value: string}>}
   */
  const findByIdsSync = (ids) => {
    const map = new Map();
    if (!ids || ids.length === 0) return map;
    const placeholders = ids.map(() => '?').join(',');
    const rows = db
      .prepare(`SELECT id, suit, value FROM cards WHERE id IN (${placeholders})`)
      .all(...ids);
    for (const row of rows) {
      map.set(row.id, row);
    }
    return map;
  };

  return { findAll, findById, findByIdsSync };
};

module.exports = { createCardsRepo };
