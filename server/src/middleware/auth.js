const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { getEnv } = require("../config/env");
const { findUserById } = require("../utils/fallbackStore");

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

async function protect(req, _res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      const error = new Error("Not authorized");
      error.status = 401;
      throw error;
    }

    const { jwtSecret } = getEnv();
    const decoded = jwt.verify(token, jwtSecret);
    const user = isDatabaseReady()
      ? await User.findById(decoded.id).select("-password").lean()
      : findUserById(decoded.id);

    if (!user) {
      const error = new Error("User not found");
      error.status = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    if (!error.status) {
      error.status = 401;
      error.message = "Invalid or expired token";
    }
    next(error);
  }
}

module.exports = { protect };
