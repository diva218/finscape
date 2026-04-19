const Scenario = require("../models/Scenario");
const mongoose = require("mongoose");
const { simulateDecision } = require("../services/simulationEngine");
const {
  saveScenario,
  findScenariosByUser,
  findScenarioById,
  updateScenario,
  removeScenario
} = require("../utils/fallbackStore");

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

async function createScenario(req, res, next) {
  try {
    const payload = req.body || {};

    const scenarioName = String(payload.name || `Scenario ${new Date().toISOString().slice(0, 10)}`);

    const normalizedInputs = payload.inputs && typeof payload.inputs === "object"
      ? payload.inputs
      : {
          income: Number(payload.income) || 0,
          fixedExpenses: Number(payload.expenses) || 0,
          events: Array.isArray(payload.events) ? payload.events : []
        };

    const simulationResult = simulateDecision(normalizedInputs, payload.financialPersonality);

    const scenario = isDatabaseReady()
      ? await Scenario.create({
          userId: req.user._id,
          name: scenarioName,
          financialPersonality: payload.financialPersonality || "moderate",
          inputs: normalizedInputs,
          latestResult: simulationResult
        })
      : saveScenario({
          userId: req.user._id,
          name: scenarioName,
          financialPersonality: payload.financialPersonality || "moderate",
          inputs: normalizedInputs,
          latestResult: simulationResult
        });

    return res.status(201).json(scenario);
  } catch (error) {
    next(error);
  }
}

async function getScenariosByUser(req, res, next) {
  try {
    const userId = req.user._id;

    const scenarios = isDatabaseReady()
      ? await Scenario.find({ userId }).sort({ createdAt: -1 }).lean()
      : findScenariosByUser(userId);
    return res.json(scenarios);
  } catch (error) {
    next(error);
  }
}

async function updateScenarioById(req, res, next) {
  try {
    const { scenarioId } = req.params;
    const payload = req.body || {};

    const scenario = isDatabaseReady()
      ? await Scenario.findOne({ _id: scenarioId, userId: req.user._id })
      : findScenarioById(scenarioId);

    if (!scenario || String(scenario.userId || scenario.userId?._id) !== String(req.user._id)) {
      return res.status(404).json({ message: "Scenario not found" });
    }

    const nextName = payload.name || scenario.name;
    const nextPersonality = payload.financialPersonality || scenario.financialPersonality;
    const nextInputs = payload.inputs || scenario.inputs;
    const latestResult = simulateDecision(nextInputs || {}, nextPersonality);

    const updated = isDatabaseReady()
      ? await Scenario.findOneAndUpdate(
          { _id: scenarioId, userId: req.user._id },
          {
            name: nextName,
            financialPersonality: nextPersonality,
            inputs: nextInputs,
            latestResult
          },
          { new: true, runValidators: true }
        ).lean()
      : updateScenario(scenarioId, {
          name: nextName,
          financialPersonality: nextPersonality,
          inputs: nextInputs,
          latestResult
        });

    return res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteScenarioById(req, res, next) {
  try {
    const { scenarioId } = req.params;

    if (isDatabaseReady()) {
      const deleted = await Scenario.findOneAndDelete({ _id: scenarioId, userId: req.user._id }).lean();
      if (!deleted) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      return res.json({ deleted: true, scenarioId });
    }

    const scenario = findScenarioById(scenarioId);
    if (!scenario || String(scenario.userId) !== String(req.user._id)) {
      return res.status(404).json({ message: "Scenario not found" });
    }

    removeScenario(scenarioId);
    return res.json({ deleted: true, scenarioId });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createScenario,
  getScenariosByUser,
  updateScenarioById,
  deleteScenarioById
};
