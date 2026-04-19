import { useEffect, useMemo, useState } from "react";
import AppFrame from "../components/AppFrame";
import { getScenariosByUser } from "../api/client";
import { useAuth } from "../context/AuthContext";
import AnimatedCard from "../components/AnimatedCard";
import GradientText from "../components/GradientText";
import { FaLightbulb, FaRegFaceSmileBeam, FaWandMagicSparkles } from "react-icons/fa6";

function buildSuggestions(scenario) {
  const latest = scenario?.latestResult;
  const inputs = scenario?.inputs || {};
  const events = Array.isArray(inputs.events) ? inputs.events : [];

  if (!latest) return ["Run a simulation to unlock personalized guidance."];

  const suggestions = [];
  const emiRatio = latest.breakdown?.monthlyIncome
    ? latest.breakdown.emi / latest.breakdown.monthlyIncome
    : 0;

  const monthlyIncome = Number(inputs.income || latest.breakdown?.monthlyIncome || 0);
  const monthlyOutflow = Number(inputs.fixedExpenses || 0)
    + Number(inputs.emi || 0)
    + Number(inputs.investments || 0)
    + Number(inputs.discretionarySpend || 0);
  const projectedNet = monthlyIncome - monthlyOutflow;

  if (emiRatio > 0.35) suggestions.push("Reduce EMI burden below 35% of income to free up cash flow.");
  if (latest.stressScore >= 7) suggestions.push("Increase emergency savings to at least 6 months of expenses.");
  if (latest.riskLevel === "HIGH") suggestions.push("Pause lifestyle upgrades until your monthly balances turn positive.");
  if (projectedNet < 0) suggestions.push("This plan has negative monthly cash flow. Reduce expenses or increase income before this decision.");
  if (Number(inputs.investments || 0) < monthlyIncome * 0.1) suggestions.push("Increase investments toward 10% of income for better long-term outcomes.");

  const incomeEvents = events.filter((event) => event?.type === "income").length;
  const expenseEvents = events.filter((event) => event?.type !== "income").length;
  if (expenseEvents > incomeEvents + 1) suggestions.push("You have more expense decisions than income boosters. Add one income event to test mitigation.");

  if (!suggestions.length) suggestions.push("Your plan is stable. Consider investing extra surplus monthly.");

  return suggestions;
}

export default function InsightsPage() {
  const [scenarios, setScenarios] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    getScenariosByUser(token)
      .then(setScenarios)
      .catch(() => setScenarios([]));
  }, [token]);

  const latestScenario = scenarios[0];
  const latest = latestScenario?.latestResult;
  const suggestions = useMemo(() => buildSuggestions(latestScenario), [latestScenario]);

  return (
    <AppFrame>
      <section className="glass-card pastel-border p-5 md:p-6">
        <GradientText as="h1" className="font-[Poppins] text-3xl font-extrabold">AI-like Financial Insights</GradientText>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <AnimatedCard className="pastel-panel p-4" delay={0.02}>
            <h2 className="cute-title flex items-center gap-2 font-semibold"><FaRegFaceSmileBeam className="text-[#d79ab8]" />Spending Patterns</h2>
            <p className="cute-subtext mt-2 text-sm">
              Fixed + EMI + Investments: {(latest?.breakdown?.fixedExpenses || 0) + (latest?.breakdown?.emi || 0) + (latest?.breakdown?.investments || 0)}
            </p>
          </AnimatedCard>
          <AnimatedCard className="pastel-panel p-4" delay={0.08}>
            <h2 className="cute-title flex items-center gap-2 font-semibold"><FaWandMagicSparkles className="text-[#d79ab8]" />Risk Trend</h2>
            <p className="cute-subtext mt-2 text-sm">
              Current level: {latest?.riskLevel || "N/A"} | Stress: {latest?.stressScore || "N/A"}/10
            </p>
          </AnimatedCard>
          <AnimatedCard className="pastel-panel p-4" delay={0.14}>
            <h2 className="cute-title flex items-center gap-2 font-semibold"><FaLightbulb className="text-[#d79ab8]" />Personality Fit</h2>
            <p className="cute-subtext mt-2 text-sm">Mode: {latestScenario?.financialPersonality || "moderate"}</p>
          </AnimatedCard>
        </div>

        <div className="pastel-panel mt-5 p-5">
          <h2 className="cute-title font-semibold">Suggestions</h2>
          <div className="cute-subtext mt-3 space-y-2 text-sm">
            {suggestions.map((line) => (
              <p key={line}>- {line}</p>
            ))}
          </div>
        </div>
      </section>
    </AppFrame>
  );
}
