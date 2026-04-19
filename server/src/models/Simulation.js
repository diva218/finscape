const mongoose = require("mongoose");

const warningSchema = new mongoose.Schema(
  {
    level: { type: String, enum: ["low", "medium", "high"], required: true },
    message: { type: String, required: true }
  },
  { _id: false }
);

const simulationSchema = new mongoose.Schema(
  {
    monthlyBalances: [{ type: Number, required: true }],
    stressScore: { type: Number, required: true },
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
    warnings: [warningSchema],
    totalIncome: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },
    savingsRate: { type: Number, default: 0 },
    breakdown: {
      monthlyIncome: { type: Number, required: true },
      fixedExpenses: { type: Number, required: true },
      emi: { type: Number, default: 0 },
      investments: { type: Number, default: 0 },
      discretionarySpend: { type: Number, default: 0 },
      rentChange: { type: Number, default: 0 }
    },
    personalityMode: {
      type: String,
      enum: ["conservative", "moderate", "aggressive"],
      default: "moderate"
    }
  },
  { _id: false }
);

module.exports = simulationSchema;
