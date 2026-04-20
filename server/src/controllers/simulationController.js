const Scenario = require("../models/Scenario");
const mongoose = require("mongoose");
const { simulateFinancialPlan } = require("../services/simulationEngine");
const { generateInsights, generateRecommendations } = require("../services/insightsEngine");
const { findScenariosByUser, findScenarioById } = require("../utils/fallbackStore");

function canUseDatabaseForUser(userId) {
  return mongoose.connection.readyState === 1 && mongoose.isValidObjectId(String(userId));
}

function toSimulationInput(source = {}) {
  if (source.inputs && typeof source.inputs === "object") {
    return source.inputs;
  }

  return {
    income: Number(source.income) || 0,
    fixedExpenses: Number(source.fixedExpenses ?? source.expenses) || 0,
    emi: Number(source.emi) || 0,
    investments: Number(source.investments) || 0,
    discretionarySpend: Number(source.discretionarySpend) || 0,
    initialBalance: Number(source.initialBalance) || 0,
    months: Number(source.months) || 12,
    events: Array.isArray(source.events) ? source.events : []
  };
}

async function runSimulation(req, res, next) {
  try {
    const { scenarioId } = req.body || {};
    const simulationInput = toSimulationInput(req.body || {});
    const result = simulateFinancialPlan(simulationInput);

    if (scenarioId) {
      const scenario = canUseDatabaseForUser(req.user._id)
        ? await Scenario.findOne({ _id: scenarioId, userId: req.user._id })
        : findScenarioById(scenarioId);
      if (!scenario || String(scenario.userId || scenario.userId?._id) !== String(req.user._id)) {
        return res.status(404).json({ message: "Scenario not found" });
      }

      if (canUseDatabaseForUser(req.user._id)) {
        scenario.latestResult = result;
        await scenario.save();
      }
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getSimulationResult(req, res, next) {
  try {
    const { scenarioId } = req.params;
    const scenario = canUseDatabaseForUser(req.user._id)
      ? await Scenario.findOne({ _id: scenarioId, userId: req.user._id }).lean()
      : findScenarioById(scenarioId);

    if (!scenario || String(scenario.userId || scenario.userId?._id) !== String(req.user._id)) {
      return res.status(404).json({ message: "Scenario not found" });
    }

    return res.json({
      scenarioId: scenario._id,
      name: scenario.name,
      result: scenario.latestResult
    });
  } catch (error) {
    next(error);
  }
}

async function getInsights(req, res, next) {
  try {
    const { scenarioId } = req.params;
    const scenario = canUseDatabaseForUser(req.user._id)
      ? await Scenario.findOne({ _id: scenarioId, userId: req.user._id }).lean()
      : findScenarioById(scenarioId);

    if (!scenario || String(scenario.userId || scenario.userId?._id) !== String(req.user._id)) {
      return res.status(404).json({ message: "Scenario not found" });
    }

    if (!scenario.latestResult) {
      return res.status(400).json({ message: "Run simulation first" });
    }

    const insights = await generateInsights({
      monthlyBalances: scenario.latestResult.monthlyBalances,
      income: scenario.inputs?.income ?? scenario.latestResult.totalIncome,
      expenses:
        (scenario.inputs?.fixedExpenses ?? 0) +
        (scenario.inputs?.emi ?? 0) +
        (scenario.inputs?.investments ?? 0) +
        (scenario.inputs?.discretionarySpend ?? 0),
      finalBalance: scenario.latestResult.finalBalance ?? scenario.latestResult.monthlyBalances?.slice(-1)[0],
      totalIncome: scenario.latestResult.totalIncome,
      totalExpense: scenario.latestResult.totalExpense
    });

    res.json({ insights });
  } catch (error) {
    next(error);
  }
}

async function postInsights(req, res, next) {
  try {
    const simulationInput = {
      monthlyBalances: Array.isArray(req.body?.monthlyBalances) ? req.body.monthlyBalances : [],
      income: Number(req.body?.income) || 0,
      expenses: Number(req.body?.expenses) || 0,
      finalBalance: Number(req.body?.finalBalance) || 0,
      stressScore: Number(req.body?.stressScore) || 0
    };

    const insights = generateInsights(simulationInput);
    return res.json({ insights });
  } catch (error) {
    next(error);
  }
}

async function getRecommendations(req, res, next) {
  try {
    const scenarios = canUseDatabaseForUser(req.user._id)
      ? await Scenario.find({ userId: req.user._id }).lean()
      : findScenariosByUser(req.user._id);

    if (scenarios.length === 0) {
      return res.json({ recommendations: null });
    }

    const scenariosWithResults = scenarios
      .map((s) => ({
        name: s.name,
        simulation: s.latestResult
      }))
      .filter((s) => s.simulation);

    if (scenariosWithResults.length === 0) {
      return res.json({ recommendations: null });
    }

    const recommendations = await generateRecommendations(
      req.user._id.toString(),
      scenariosWithResults
    );

    res.json({ recommendations });
  } catch (error) {
    next(error);
  }
}

async function compareScenarios(req, res, next) {
  try {
    const { scenarioIdA, scenarioIdB } = req.body || {};

    if (!scenarioIdA || !scenarioIdB) {
      return res.status(400).json({ message: "scenarioIdA and scenarioIdB are required" });
    }

    if (String(scenarioIdA) === String(scenarioIdB)) {
      return res.status(400).json({ message: "Please select two different scenarios" });
    }

    const scenarios = canUseDatabaseForUser(req.user._id)
      ? await Scenario.find({
          _id: { $in: [scenarioIdA, scenarioIdB] },
          userId: req.user._id
        }).lean()
      : [findScenarioById(scenarioIdA), findScenarioById(scenarioIdB)]
          .filter(Boolean)
          .filter((scenario) => String(scenario.userId || scenario.userId?._id) === String(req.user._id));

    if (scenarios.length !== 2) {
      return res.status(404).json({ message: "One or both scenarios were not found" });
    }

    const evaluated = scenarios.map((scenario) => {
      const simulation = scenario.latestResult || simulateFinancialPlan(scenario.inputs || {});
      return {
        _id: scenario._id,
        name: scenario.name,
        simulation
      };
    });

    const [first, second] = evaluated;

    const firstFinal = Number(first.simulation.finalBalance || 0);
    const secondFinal = Number(second.simulation.finalBalance || 0);
    const better = firstFinal >= secondFinal ? first : second;
    const worse = better._id === first._id ? second : first;

    const betterFinal = Number(better.simulation.finalBalance || 0);
    const worseFinal = Number(worse.simulation.finalBalance || 0);
    const betterStress = Number(better.simulation.stressScore || 0);
    const worseStress = Number(worse.simulation.stressScore || 0);

    const finalBalanceDiff = Math.abs(betterFinal - worseFinal).toFixed(2);
    const stressDiff = Math.abs(worseStress - betterStress).toFixed(1);

    const reason = `${better.name} is better because its final balance is higher by ${finalBalanceDiff}. Stress score difference between selected scenarios is ${stressDiff}.`;

    return res.json({
      betterScenario: better.name,
      reason
    });
  } catch (error) {
    next(error);
  }
}

async function compareAllScenarios(req, res, next) {
  try {
    const { scenarioIds } = req.body || {};

    if (!Array.isArray(scenarioIds) || !scenarioIds.length) {
      return res.status(400).json({ message: "scenarioIds array is required" });
    }

    const uniqueIds = [...new Set(scenarioIds.map((id) => String(id)).filter(Boolean))];

    const scenarios = canUseDatabaseForUser(req.user._id)
      ? await Scenario.find({
          _id: { $in: uniqueIds },
          userId: req.user._id
        }).lean()
      : uniqueIds
          .map((id) => findScenarioById(id))
          .filter(Boolean)
          .filter((scenario) => String(scenario.userId || scenario.userId?._id) === String(req.user._id));

    if (!scenarios.length) {
      return res.status(404).json({ message: "No scenarios were found" });
    }

    const scored = scenarios.map((scenario) => {
      const simulation = scenario.latestResult || simulateFinancialPlan(scenario.inputs || {});
      const finalBalance = Number(simulation.finalBalance || 0);
      const stressScore = Number(simulation.stressScore || 0);
      const savingsRate = Number(simulation.savingsRate || 0);

      const score = Number((finalBalance * 0.001 + savingsRate * 2 - stressScore * 1.5).toFixed(2));

      return {
        scenarioId: scenario._id,
        name: scenario.name,
        score,
        finalBalance,
        stressScore,
        savingsRate,
        riskLevel: simulation.riskLevel || "UNKNOWN"
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return res.json({
      ranking: scored,
      bestScenario: scored[0]?.name || null
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  runSimulation,
  getSimulationResult,
  getInsights,
  postInsights,
  getRecommendations,
  compareScenarios,
  compareAllScenarios
};
