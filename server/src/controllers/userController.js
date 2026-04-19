const User = require("../models/User");
const mongoose = require("mongoose");
const { updateUser } = require("../utils/fallbackStore");

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

async function getProfile(req, res, next) {
  try {
    return res.json(req.user);
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { income, expenses, riskTolerance, theme } = req.body || {};

    const updates = {};
    if (typeof income !== "undefined") updates.income = Number(income) || 0;
    if (typeof expenses !== "undefined") updates.expenses = Number(expenses) || 0;
    if (typeof riskTolerance !== "undefined") updates.riskTolerance = riskTolerance;
    if (typeof theme !== "undefined") updates.theme = theme;

    const user = isDatabaseReady()
      ? await User.findByIdAndUpdate(req.user._id, updates, {
          new: true,
          runValidators: true
        })
          .select("-password")
          .lean()
      : updateUser(req.user._id, updates);

    return res.json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile };
