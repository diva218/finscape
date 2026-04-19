const express = require("express");
const { submitPersonalityQuiz, getPersonality } = require("../controllers/personalityController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// POST: Submit personality quiz
router.post("/quiz", protect, submitPersonalityQuiz);

// GET: Retrieve personality for user
router.get("/:userId", protect, getPersonality);

module.exports = router;
