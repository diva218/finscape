const mongoose = require("mongoose");

const PersonalitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    type: {
      type: String, // "Conservative" | "Balanced" | "Risky"
      required: true,
      enum: ["Conservative", "Balanced", "Risky"]
    },
    spendingHabits: {
      type: String, // "frugal" | "moderate" | "spender"
      required: true
    },
    riskTolerance: {
      type: String, // "low" | "medium" | "high"
      required: true
    },
    savingsBehavior: {
      type: String, // "always_saves" | "sometimes_saves" | "rarely_saves"
      required: true
    },
    quizCompletedAt: {
      type: Date,
      default: Date.now
    },
    insights: {
      stressThreshold: { type: Number, default: 7 }, // 0-10 scale
      warningTriggers: {
        type: [String],
        default: []
      },
      recommendationStyle: { type: String, default: "balanced" }
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Personality ||
  mongoose.model("Personality", PersonalitySchema);
