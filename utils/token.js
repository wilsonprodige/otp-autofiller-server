const jwt = require('jsonwebtoken');
const config = require('../config/global');

const generateToken = (userId) => {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
  };
  return jwt.sign(payload, config.jwt.secret);
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = {
  generateToken,
  verifyToken,
};