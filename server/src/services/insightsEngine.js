function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function calculateMetrics(simulation) {
  const monthlyBalances = Array.isArray(simulation?.monthlyBalances) ? simulation.monthlyBalances : [];
  const months = monthlyBalances.length || 12;
  const monthlyIncome = toNumber(
    simulation?.breakdown?.monthlyIncome
      ?? simulation?.income
      ?? (toNumber(simulation?.totalIncome, 0) / Math.max(months, 1)),
    0
  );
  const monthlyExpensesFromBreakdown =
    toNumber(simulation?.breakdown?.fixedExpenses, 0)
    + toNumber(simulation?.breakdown?.emi, 0)
    + toNumber(simulation?.breakdown?.investments, 0)
    + toNumber(simulation?.breakdown?.discretionarySpend, 0)
    + toNumber(simulation?.breakdown?.rentChange, 0);
  const monthlyExpense = toNumber(
    monthlyExpensesFromBreakdown > 0
      ? monthlyExpensesFromBreakdown
      : simulation?.expenses ?? (toNumber(simulation?.totalExpense, 0) / Math.max(months, 1)),
    0
  );

  const income = Number((monthlyIncome * months).toFixed(2));
  const expenses = Number((monthlyExpense * months).toFixed(2));
  const finalBalance = monthlyBalances.length ? monthlyBalances[monthlyBalances.length - 1] : toNumber(simulation?.finalBalance, 0);

  const negativeMonthIndex = monthlyBalances.findIndex((balance) => Number(balance) < 0);
  const negativeMonths = monthlyBalances.filter((balance) => Number(balance) < 0).length;
  const stressScore = toNumber(simulation?.stressScore, monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) * 10 : 10);
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;

  return {
    monthlyBalances,
    income,
    expenses,
    finalBalance,
    negativeMonthIndex,
    negativeMonths,
    stressScore,
    savingsRate
  };
}

function generateInsights(simulation = {}) {
  const metrics = calculateMetrics(simulation);
  const insights = [];

  if (metrics.negativeMonthIndex !== -1) {
    insights.push(`You run out of money in month ${metrics.negativeMonthIndex + 1}`);
  }

  if (metrics.expenses > metrics.income) {
    insights.push("Your expenses exceed your income");
  }

  if (metrics.finalBalance < metrics.income) {
    insights.push("Your savings are low");
  }

  if (metrics.stressScore >= 7) {
    insights.push("Your stress score is high. Consider reducing fixed outflows or adding income events.");
  } else if (metrics.stressScore >= 4) {
    insights.push("Your stress score is moderate. Small expense cuts can materially improve resilience.");
  } else {
    insights.push("Your stress score is healthy based on current monthly cash flow.");
  }

  insights.push(`Projected ending balance is ${Number(metrics.finalBalance).toFixed(2)}.`);

  if (metrics.savingsRate < 10) {
    insights.push("Savings rate is below 10%. Aim to increase it for better long-term stability.");
  } else {
    insights.push(`Savings rate is ${metrics.savingsRate.toFixed(1)}%, which supports your financial cushion.`);
  }

  if (!insights.length) {
    insights.push("Your plan stays positive across the full projection.");
  }

  return insights;
}

// Generate recommendations based on personality and metrics
async function generateRecommendations(userId, scenarios) {
  try {
    const Personality = require("../models/Personality");
    const personality = await Personality.findOne({ userId });
    const personalityType = personality?.type || "Balanced";

    if (!Array.isArray(scenarios) || scenarios.length === 0) {
      return null;
    }

    // Rank scenarios by stress and savings
    const rankedScenarios = scenarios.map((scenario) => {
      const metrics = calculateMetrics(scenario.simulation);
      let score = 100;

      // Penalize based on stress vs personality
      if (personalityType === "Conservative") {
        score -= metrics.stressScore * 3;
      } else if (personalityType === "Balanced") {
        score -= metrics.stressScore * 2;
      } else {
        score -= metrics.stressScore * 1;
      }

      // Reward good savings
      score += metrics.savingsRate;

      // Reward stronger ending cash position.
      score += Math.max(-25, Math.min(25, metrics.finalBalance / 50000));

      return { ...scenario, score, metrics };
    });

    rankedScenarios.sort((a, b) => b.score - a.score);

    const best = rankedScenarios[0];
    const recommendations = {
      bestScenario: {
        name: best.name,
        reason: `This scenario aligns best with your ${personalityType} profile.`,
        stressScore: best.metrics.stressScore,
        savingsRate: best.metrics.savingsRate
      },
      alternatives: rankedScenarios.slice(1, 3).map((s) => ({
        name: s.name,
        reason: s.metrics.stressScore < best.metrics.stressScore
          ? "Lower stress"
          : s.metrics.finalBalance > best.metrics.finalBalance
            ? "Higher ending balance"
            : "Better savings"
      })),
      personalizedTips: getPersonalizedTips({ type: personalityType }, best.metrics),
      scoringMethod: "Score = 100 - stressPenalty + savingsRate + finalBalanceBonus. Stress penalty weight depends on personality (Conservative: 3x, Balanced: 2x, Risky: 1x).",
      scenarioScores: rankedScenarios.map((entry) => ({
        name: entry.name,
        score: Number(entry.score.toFixed(2)),
        stressScore: Number(entry.metrics.stressScore.toFixed(1)),
        savingsRate: Number(entry.metrics.savingsRate.toFixed(1)),
        finalBalance: Number(entry.metrics.finalBalance.toFixed(2))
      }))
    };

    return recommendations;
  } catch (error) {
    console.error("Recommendations generation failed:", error);
    return null;
  }
}

function getPersonalizedTips(personality, metrics) {
  const tips = [];

  if (personality.type === "Conservative") {
    tips.push("Build an emergency fund covering 6+ months of expenses");
    if (metrics.negativeMonths > 0) {
      tips.push("Avoid scenarios with negative balance months");
    }
  } else if (personality.type === "Balanced") {
    tips.push("Aim for steady 15-20% monthly savings");
    tips.push("Keep emergency fund for 3-4 months");
  } else {
    tips.push("Monitor cash flow closely in volatile months");
    tips.push("Ensure income sources are reliable");
  }

  if (metrics.savingsRate < 15) {
    tips.push("Review expenses to increase savings capacity");
  }

  return tips;
}

module.exports = {
  calculateMetrics,
  generateInsights,
  generateRecommendations
};
