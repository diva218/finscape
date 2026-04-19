import { useEffect, useMemo, useState } from "react";
import { Checkbox, FormControlLabel, LinearProgress } from "@mui/material";
import AppFrame from "../components/AppFrame";
import ScenarioCompareChart from "../components/ScenarioCompareChart";
import SimulationChart from "../components/SimulationChart";
import { compareAllScenarios, compareScenarios, getScenariosByUser } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSimulationStore } from "../store/simulationStore";
import AnimatedCard from "../components/AnimatedCard";
import { HiMiniChartBarSquare } from "react-icons/hi2";
import { buildStoryPoints } from "../utils/storyPoints";
import InsightsPanel from "../components/InsightsPanel";
import RecommendationsPanel from "../components/RecommendationsPanel";
import AiAdvisorPanel from "../components/AiAdvisorPanel";

export default function ResultsPage() {
  const { token } = useAuth();
  const { comparedScenarioIds, setComparedScenarioIds, scenarios, setScenarios } = useSimulationStore();
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparisonRanking, setComparisonRanking] = useState([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState("");

  useEffect(() => {
    if (!token) return;

    getScenariosByUser(token)
      .then((items) => {
        const safeItems = Array.isArray(items) ? items : [];
        setScenarios(safeItems);

        const availableIds = new Set(safeItems.map((item) => item._id));
        const nextCompared = comparedScenarioIds.filter((id) => availableIds.has(id));

        if (nextCompared.length !== comparedScenarioIds.length) {
          setComparedScenarioIds(nextCompared);
          return;
        }

        if (!nextCompared.length && safeItems.length > 0) {
          setComparedScenarioIds(safeItems.slice(0, Math.min(3, safeItems.length)).map((item) => item._id));
        }
      })
      .catch(() => setScenarios([]));
  }, [token, comparedScenarioIds, setComparedScenarioIds, setScenarios]);

  const selectedScenarios = useMemo(() => {
    const selected = scenarios.filter((item) => comparedScenarioIds.includes(item._id));
    return selected.length ? selected : scenarios.slice(0, 1);
  }, [comparedScenarioIds, scenarios]);

  const comparisonPair = useMemo(() => selectedScenarios.slice(0, 2), [selectedScenarios]);
  const selectedScenarioIdsKey = useMemo(
    () => selectedScenarios.map((scenario) => scenario._id).join("|"),
    [selectedScenarios]
  );
  const comparisonPairKey = useMemo(
    () => comparisonPair.map((scenario) => scenario._id).join("|"),
    [comparisonPair]
  );

  useEffect(() => {
    async function runComparison() {
      if (!token || comparisonPair.length !== 2) {
        setComparisonResult(null);
        setComparisonLoading(false);
        return;
      }

      setComparisonLoading(true);
      setComparisonError("");

      try {
        const rankingData = await compareAllScenarios(
          { scenarioIds: selectedScenarios.map((scenario) => scenario._id) },
          token
        );
        setComparisonRanking(Array.isArray(rankingData.ranking) ? rankingData.ranking : []);

        const data = await compareScenarios(
          {
            scenarioIdA: comparisonPair[0]._id,
            scenarioIdB: comparisonPair[1]._id
          },
          token
        );

        setComparisonResult(data);
      } catch (err) {
        setComparisonRanking([]);
        setComparisonError(err.message || "Unable to compare scenarios right now.");
      } finally {
        setComparisonLoading(false);
      }
    }

    runComparison();
  }, [comparisonPairKey, selectedScenarioIdsKey, token]);

  const primary = selectedScenarios[0]?.latestResult;
  const scorePercent = Math.min(100, ((primary?.stressScore || 0) / 10) * 100);
  const points = buildStoryPoints(primary?.monthlyBalances || [], selectedScenarios[0]?.inputs?.events || []);

  return (
    <AppFrame>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.05fr]">
        <AnimatedCard className="rounded-2xl bg-white p-5 md:p-6 shadow-sm border border-slate-200">
          <h2 className="flex items-center gap-2 font-[Poppins] text-2xl font-bold text-slate-900">
            <HiMiniChartBarSquare className="text-indigo-600" /> Simulation Results
          </h2>
          <div className="mt-4">
            <SimulationChart points={points} color="#6366f1" />
          </div>
          <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <p className="font-semibold text-slate-900">Stress Score: {primary?.stressScore ?? "--"}/10</p>
            <LinearProgress
              variant="determinate"
              value={scorePercent}
              sx={{ mt: 2, borderRadius: 999, background: "#e0e7ff", "& .MuiLinearProgress-bar": { background: "#6366f1" } }}
            />
            <p className="text-sm font-bold text-slate-800 mt-3">Risk Level: {primary?.riskLevel || "N/A"}</p>
            <div className="mt-3 space-y-2 text-sm">
              {(primary?.warnings || []).map((warning, idx) => (
                <p key={`${warning.level}-${idx}`} className="font-semibold text-slate-800">
                  <span className="font-bold text-indigo-700">[{warning.level.toUpperCase()}]</span> {warning.message}
                </p>
              ))}
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="rounded-2xl bg-white p-5 md:p-6 shadow-sm border border-slate-200" delay={0.08}>
          <h2 className="font-[Poppins] text-2xl font-bold text-slate-900">Compare Scenarios</h2>
          <p className="mt-1 text-sm font-bold text-slate-700">Select any two scenarios to compare their real simulation results.</p>
          <div className="mt-4 space-y-2">
            {scenarios.map((scenario) => (
              <FormControlLabel
                key={scenario._id}
                sx={{ "& .MuiFormControlLabel-label": { fontWeight: 700, color: "#1e293b" } }}
                control={
                  <Checkbox
                    checked={comparedScenarioIds.includes(scenario._id)}
                    onChange={(e) => {
                      if (e.target.checked && comparedScenarioIds.length < 6) {
                        setComparedScenarioIds([...comparedScenarioIds, scenario._id]);
                      }
                      if (!e.target.checked) {
                        setComparedScenarioIds(comparedScenarioIds.filter((id) => id !== scenario._id));
                      }
                    }}
                  />
                }
                label={scenario.name}
              />
            ))}
          </div>
          <p className="text-xs font-bold text-slate-600">You can plot up to 6 scenarios. Winner card compares the first 2 selected scenarios.</p>
          <div className="mt-4">
            <ScenarioCompareChart scenarios={selectedScenarios} />
          </div>
          <div className="mt-4 min-h-6">
            {comparisonLoading && <p className="text-sm font-bold text-slate-600">Comparing selected scenarios...</p>}
            {comparisonError && <p className="text-sm font-bold text-rose-600">{comparisonError}</p>}
          </div>
          {comparisonResult && (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 shadow-sm">
              <p className="text-sm font-bold text-emerald-900">✓ Better Scenario: {comparisonResult.betterScenario}</p>
              <p className="mt-1 text-sm font-semibold text-emerald-800">{comparisonResult.reason}</p>
            </div>
          )}
          {comparisonRanking.length > 0 && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-700">RANKED VIEW (SELECTED SCENARIOS)</p>
              <div className="mt-2 space-y-2">
                {comparisonRanking.map((item, idx) => (
                  <div key={`${item.scenarioId}-${idx}`} className="rounded-xl bg-white border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-slate-900">#{idx + 1} {item.name}</p>
                      <p className="text-sm font-bold text-indigo-700">Score: {item.score}</p>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      Risk: {item.riskLevel} | Stress: {item.stressScore}/10 | Savings: {item.savingsRate}% | Final: {item.finalBalance}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnimatedCard>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <AnimatedCard className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200" delay={0.12}>
          <h3 className="text-xl font-bold text-slate-900">Key Insights</h3>
          <p className="mt-1 text-sm font-bold text-slate-700">Analysis based on your selected scenario.</p>
          <div className="mt-4">
            <InsightsPanel scenarioId={selectedScenarios[0]?._id} />
          </div>
        </AnimatedCard>

        <AnimatedCard className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200" delay={0.16}>
          <h3 className="text-xl font-bold text-slate-900">Recommendations</h3>
          <p className="mt-1 text-sm font-bold text-slate-700">Smart next steps tailored to your financial profile.</p>
          <div className="mt-4">
            <RecommendationsPanel />
          </div>
        </AnimatedCard>
      </div>

      <AiAdvisorPanel scenario={selectedScenarios[0]} />
    </AppFrame>
  );
}
