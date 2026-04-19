const jwt = require("jsonwebtoken");
const { getEnv } = require("../config/env");

function signToken(userId) {
  const { jwtSecret, jwtExpiresIn } = getEnv();
  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn });
}

module.exports = { signToken };
