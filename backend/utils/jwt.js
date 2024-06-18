const jwt = require('jsonwebtoken');

const generateToken = (username) => {
  return jwt.sign({ username }, process.env.SECRET, { expiresIn: '8h' });
};

module.exports = generateToken;
