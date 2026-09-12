const Card = require('../../models/card');
const { toPlain } = require('../helpers');

/**
 * @returns {{ findAll: Function, findById: Function }}
 */
const createCardsRepo = () => {
  /**
   * @returns {Promise<Array<{id: string, suit: string, value: string}>>}
   */
  const findAll = async () => {
    const docs = await Card.find({});
    return docs.map(toPlain);
  };

  /**
   * @param {string} id
   * @returns {Promise<{id: string, suit: string, value: string}|null>}
   */
  const findById = async (id) => {
    const doc = await Card.findById(id);
    return toPlain(doc);
  };

  return { findAll, findById };
};

module.exports = { createCardsRepo };
