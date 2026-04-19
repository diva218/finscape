const express = require("express");
const { protect } = require("../middleware/auth");
const { analyzeScenario } = require("../controllers/aiController");

const router = express.Router();

router.post("/analyze", protect, analyzeScenario);

module.exports = router;
