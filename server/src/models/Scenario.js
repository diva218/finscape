const mongoose = require("mongoose");
const simulationSchema = require("./Simulation");

const scenarioSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    financialPersonality: {
      type: String,
      enum: ["conservative", "moderate", "aggressive"],
      default: "moderate"
    },
    inputs: {
      income: { type: Number, default: 0 },
      fixedExpenses: { type: Number, default: 0 },
      emi: { type: Number, default: 0 },
      investments: { type: Number, default: 0 },
      discretionarySpend: { type: Number, default: 0 },
      rentChange: { type: Number, default: 0 },
      lifestyleUpgrade: { type: Number, default: 0 },
      initialBalance: { type: Number, default: 0 },
      months: { type: Number, default: 12 },
      events: [
        {
          name: { type: String, required: true },
          month: { type: Number, default: 1 },
          amount: { type: Number, default: 0 },
          type: { type: String, enum: ["income", "expense"], default: "expense" },
          recurring: { type: Boolean, default: false }
        }
      ],
      toggles: {
        jobLoss: { type: Boolean, default: false },
        medicalExpense: { type: Boolean, default: false }
      }
    },
    latestResult: simulationSchema
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scenario", scenarioSchema);
