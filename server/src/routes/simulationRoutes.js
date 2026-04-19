const express = require("express");
const {
	runSimulation,
	getSimulationResult,
	getInsights,
	postInsights,
	getRecommendations,
	compareScenarios,
	compareAllScenarios
} = require("../controllers/simulationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/simulate", protect, runSimulation);
router.post("/insights", protect, postInsights);
router.post("/compare", protect, compareScenarios);
router.post("/compare/all", protect, compareAllScenarios);
router.get("/results/:scenarioId", protect, getSimulationResult);
router.get("/insights/:scenarioId", protect, getInsights);
router.get("/recommendations", protect, getRecommendations);

module.exports = router;
