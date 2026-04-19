const Personality = require("../models/Personality");
const User = require("../models/User");
const { saveUser, findUserById } = require("../utils/fallbackStore");
const mongoose = require("mongoose");

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

// Determine personality type based on answers
function determinePersonalityType(spending, risk, savings) {
  let score = 0;

  // Scoring logic
  if (spending === "spender") {
    score += 1;
  } else if (spending === "frugal") {
    score -= 1;
  }

  if (risk === "high") {
    score += 2;
  } else if (risk === "low") {
    score -= 2;
  }

  if (savings === "rarely_saves") {
    score += 1;
  } else if (savings === "always_saves") {
    score -= 2;
  }

  // Determine type
  if (score > 2) return "Risky";
  if (score < -2) return "Conservative";
  return "Balanced";
}

async function submitPersonalityQuiz(req, res, next) {
  try {
    const { spendingHabits, riskTolerance, savingsBehavior } = req.body;
    const authUserId = req.user?._id;

    if (!authUserId || !spendingHabits || !riskTolerance || !savingsBehavior) {
      return res.status(400).json({ 
        success: false,
        message: "spendingHabits, riskTolerance, and savingsBehavior are required" 
      });
    }

    const personalityType = determinePersonalityType(
      spendingHabits,
      riskTolerance,
      savingsBehavior
    );

    // Determine stress threshold based on personality
    const stressThreshold =
      personalityType === "Conservative"
        ? 5
        : personalityType === "Risky"
          ? 8
          : 6.5;

    // Determine warning triggers
    let warningTriggers = [];
    if (personalityType === "Conservative") {
      warningTriggers = ["negative_balance", "high_expense_spike", "low_savings_rate"];
    } else if (personalityType === "Risky") {
      warningTriggers = ["extreme_deficit"];
    } else {
      warningTriggers = ["prolonged_deficit", "savings_drop"];
    }

    let personality;

    if (isDatabaseReady()) {
      // Try to update or create in MongoDB
      personality = await Personality.findOneAndUpdate(
        { userId: authUserId },
        {
          userId: authUserId,
          type: personalityType,
          spendingHabits,
          riskTolerance,
          savingsBehavior,
          quizCompletedAt: new Date(),
          insights: {
            stressThreshold,
            warningTriggers,
            recommendationStyle: personalityType.toLowerCase()
          }
        },
        { upsert: true, new: true, lean: true }
      );

      // Also update User model if it exists
      await User.findByIdAndUpdate(
        authUserId,
        {
          $set: {
            "personality.type": personalityType,
            "personality.spendingHabits": spendingHabits,
            "personality.riskTolerance": riskTolerance,
            "personality.savingsBehavior": savingsBehavior,
            "personality.completedAt": new Date(),
            hasCompletedQuiz: true
          }
        },
        { new: true }
      );
    } else {
      // Fallback to in-memory storage
      let user = findUserById(authUserId);
      if (user) {
        user.personality = {
          type: personalityType,
          spendingHabits,
          riskTolerance,
          savingsBehavior,
          completedAt: new Date()
        };
        user.hasCompletedQuiz = true;
        saveUser(user);
      }

      personality = {
        userId: authUserId,
        type: personalityType,
        spendingHabits,
        riskTolerance,
        savingsBehavior,
        insights: {
          stressThreshold,
          warningTriggers,
          recommendationStyle: personalityType.toLowerCase()
        }
      };
    }

    res.json({
      success: true,
      personality: {
        type: personalityType,
        stressThreshold,
        warningTriggers,
        recommendationStyle: personalityType.toLowerCase()
      }
    });
  } catch (error) {
    console.error("Personality quiz error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to save personality quiz"
    });
  }
}

async function getPersonality(req, res, next) {
  try {
    const { userId } = req.params;
    const authUserId = req.user?._id?.toString();

    // Allow users to fetch their own personality or admin access
    if (authUserId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    let personality = null;

    if (isDatabaseReady()) {
      personality = await Personality.findOne({ userId: authUserId }).lean();
    } else {
      // Fallback to in-memory storage
      const user = findUserById(userId);
      if (user && user.personality && user.personality.type) {
        personality = {
          type: user.personality.type,
          spendingHabits: user.personality.spendingHabits,
          riskTolerance: user.personality.riskTolerance,
          savingsBehavior: user.personality.savingsBehavior
        };
      }
    }

    res.json({ personality });
  } catch (error) {
    console.error("Get personality error:", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { submitPersonalityQuiz, getPersonality };
