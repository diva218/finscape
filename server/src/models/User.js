const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    income: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    riskTolerance: {
      type: String,
      enum: ["conservative", "moderate", "aggressive"],
      default: "moderate"
    },
    personality: {
      type: { type: String, enum: ["Conservative", "Balanced", "Risky"], default: null },
      spendingHabits: { type: String, default: null },
      riskTolerance: { type: String, default: null },
      savingsBehavior: { type: String, default: null },
      completedAt: { type: Date, default: null }
    },
    hasCompletedQuiz: { type: Boolean, default: false },
    theme: { type: String, enum: ["light", "dark"], default: "light" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
