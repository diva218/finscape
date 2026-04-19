const users = new Map();
const scenarios = new Map();
const mongoose = require("mongoose");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createId() {
  return new mongoose.Types.ObjectId().toString();
}

function saveUser(user) {
  const record = {
    _id: user._id || createId(),
    fullName: user.fullName,
    email: String(user.email).toLowerCase(),
    password: user.password,
    income: user.income ?? 0,
    expenses: user.expenses ?? 0,
    riskTolerance: user.riskTolerance || "moderate",
    hasCompletedQuiz: Boolean(user.hasCompletedQuiz),
    theme: user.theme || "light",
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.set(record._id, record);
  return clone(record);
}

function findUserByEmail(email) {
  const normalized = String(email).toLowerCase();
  const user = [...users.values()].find((item) => item.email === normalized);
  return user ? clone(user) : null;
}

function findUserById(userId) {
  const user = users.get(String(userId));
  return user ? clone(user) : null;
}

function updateUser(userId, updates) {
  const current = users.get(String(userId));
  if (!current) return null;
  const next = {
    ...current,
    ...updates,
    email: current.email,
    updatedAt: new Date().toISOString()
  };
  users.set(String(userId), next);
  return clone(next);
}

function saveScenario(scenario) {
  const record = {
    _id: scenario._id || createId(),
    userId: String(scenario.userId),
    name: scenario.name,
    financialPersonality: scenario.financialPersonality || "moderate",
    inputs: scenario.inputs || {},
    latestResult: scenario.latestResult || null,
    createdAt: scenario.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  scenarios.set(record._id, record);
  return clone(record);
}

function findScenariosByUser(userId) {
  return [...scenarios.values()]
    .filter((scenario) => String(scenario.userId) === String(userId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((scenario) => clone(scenario));
}

function findScenarioById(scenarioId) {
  const scenario = scenarios.get(String(scenarioId));
  return scenario ? clone(scenario) : null;
}

function updateScenario(scenarioId, updates) {
  const current = scenarios.get(String(scenarioId));
  if (!current) return null;

  const next = {
    ...current,
    ...updates,
    userId: String(current.userId),
    updatedAt: new Date().toISOString()
  };

  scenarios.set(String(scenarioId), next);
  return clone(next);
}

function removeScenario(scenarioId) {
  return scenarios.delete(String(scenarioId));
}

module.exports = {
  saveUser,
  findUserByEmail,
  findUserById,
  updateUser,
  saveScenario,
  findScenariosByUser,
  findScenarioById,
  updateScenario,
  removeScenario
};
