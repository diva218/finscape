const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    monthlyIncome: { type: Number, required: true },
    fixedExpenses: { type: Number, required: true },
    currentBalance: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProfile", userProfileSchema);
