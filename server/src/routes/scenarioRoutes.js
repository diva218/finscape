const express = require("express");
const {
	createScenario,
	getScenariosByUser,
	updateScenarioById,
	deleteScenarioById
} = require("../controllers/scenarioController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createScenario);
router.get("/", protect, getScenariosByUser);
router.put("/:scenarioId", protect, updateScenarioById);
router.delete("/:scenarioId", protect, deleteScenarioById);

module.exports = router;
