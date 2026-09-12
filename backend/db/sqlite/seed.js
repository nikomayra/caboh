const { randomUUID } = require('crypto');

const SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const VALUES = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
];

/**
 * Seed the 52-card catalog when the cards table is empty.
 * @param {import('better-sqlite3').Database} db
 */
const seedCardsIfEmpty = (db) => {
  const row = db.prepare('SELECT COUNT(*) AS count FROM cards').get();
  if (row.count > 0) return;

  const insert = db.prepare(
    'INSERT INTO cards (id, suit, value) VALUES (@id, @suit, @value)'
  );

  const seed = db.transaction(() => {
    for (const suit of SUITS) {
      for (const value of VALUES) {
        insert.run({ id: randomUUID(), suit, value });
      }
    }
  });

  seed();
};

module.exports = { seedCardsIfEmpty, SUITS, VALUES };
