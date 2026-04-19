function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeEvents(events) {
  if (!Array.isArray(events)) return [];

  return events
    .filter((event) => event && event.name)
    .map((event) => ({
      name: String(event.name),
      amount: toNumber(event.amount, 0),
      month: Math.max(1, Math.min(12, toNumber(event.month, 1)))
    }));
}

function simulateFinancialPlan(input = {}, personalityMode = "moderate") {
  const income = toNumber(input.income, 0);
  const fixedExpenses = toNumber(input.fixedExpenses, 0);
  const emi = toNumber(input.emi, 0);
  const investments = toNumber(input.investments, 0);
  const discretionarySpend = toNumber(input.discretionarySpend, 0);
  const rentChange = toNumber(input.rentChange, 0);
  const initialBalance = toNumber(input.initialBalance, 0);
  const months = Math.max(1, Math.min(24, toNumber(input.months, 12)));
  const events = normalizeEvents(input.events);

  let balance = initialBalance;
  const monthlyBalances = [];
  const monthlyExpense = fixedExpenses + emi + investments + discretionarySpend + rentChange;

  for (let month = 1; month <= months; month += 1) {
    balance += income;
    balance -= monthlyExpense;

    for (const event of events) {
      if (event.month === month) {
        balance += event.amount;
      }
    }

    monthlyBalances.push(Number(balance.toFixed(2)));
  }

  const finalBalance = Number(balance.toFixed(2));
  const rawStressScore = income > 0 ? (monthlyExpense / income) * 10 : 10;
  const stressScore = Number(Math.max(0, rawStressScore).toFixed(1));
  const savingsRate = income > 0 ? Number((((income - monthlyExpense) / income) * 100).toFixed(1)) : 0;

  let riskLevel = "LOW";
  if (monthlyBalances.some((monthBalance) => monthBalance < 0)) {
    riskLevel = "HIGH";
  } else if (stressScore >= 7) {
    riskLevel = "HIGH";
  } else if (stressScore >= 4) {
    riskLevel = "MEDIUM";
  }

  const warnings = [];
  if (monthlyBalances.some((monthBalance) => monthBalance < 0)) {
    warnings.push({ level: "high", message: "Projected balance goes negative in the selected horizon." });
  }
  if (stressScore >= 7) {
    warnings.push({ level: "medium", message: "Expense-to-income ratio is creating high stress." });
  }
  if (savingsRate < 10) {
    warnings.push({ level: "low", message: "Savings rate is low; consider reducing monthly outflow." });
  }

  return {
    monthlyBalances,
    finalBalance,
    stressScore,
    riskLevel,
    warnings,
    totalIncome: Number((income * months).toFixed(2)),
    totalExpense: Number((monthlyExpense * months).toFixed(2)),
    savingsRate,
    breakdown: {
      monthlyIncome: income,
      fixedExpenses,
      emi,
      investments,
      discretionarySpend,
      rentChange
    },
    personalityMode
  };
}

function simulateDecision(payload = {}, personalityMode = "moderate") {
  return simulateFinancialPlan(payload, personalityMode);
}

module.exports = { simulateFinancialPlan, simulateDecision };
