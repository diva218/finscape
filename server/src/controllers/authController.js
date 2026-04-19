const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");
const { saveUser, findUserByEmail } = require("../utils/fallbackStore");

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

async function signup(req, res, next) {
  try {
    const { fullName, email, password } = req.body || {};

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase();
    const existingUser = isDatabaseReady()
      ? await User.findOne({ email: normalizedEmail }).lean()
      : findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = isDatabaseReady()
      ? await User.create({
          fullName,
          email: normalizedEmail,
          password: passwordHash
        })
      : saveUser({
          fullName,
          email: normalizedEmail,
          password: passwordHash
        });

    const token = signToken(user._id.toString());

    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        income: user.income,
        expenses: user.expenses,
        riskTolerance: user.riskTolerance,
        hasCompletedQuiz: Boolean(user.hasCompletedQuiz),
        theme: user.theme
      }
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase();
    const user = isDatabaseReady()
      ? await User.findOne({ email: normalizedEmail })
      : findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user._id.toString());

    return res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        income: user.income,
        expenses: user.expenses,
        riskTolerance: user.riskTolerance,
        hasCompletedQuiz: Boolean(user.hasCompletedQuiz),
        theme: user.theme
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { signup, login };
