import { useEffect, useMemo, useState } from "react";
import AppFrame from "../components/AppFrame";
import AiAdvisorPanel from "../components/AiAdvisorPanel";
import { getScenariosByUser } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AiPage() {
  const { token } = useAuth();
  const [scenarios, setScenarios] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (!token) return;

    getScenariosByUser(token)
      .then((items) => {
        const safeItems = Array.isArray(items) ? items : [];
        setScenarios(safeItems);
        setSelectedId((prev) => {
          if (!safeItems.length) return "";
          const stillExists = safeItems.some((item) => item._id === prev);
          return stillExists ? prev : safeItems[0]?._id || "";
        });
      })
      .catch(() => setScenarios([]));
  }, [token]);

  const selectedScenario = useMemo(
    () => scenarios.find((item) => item._id === selectedId) || null,
    [scenarios, selectedId]
  );

  return (
    <AppFrame>
      <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">AI Scenario Assistant</h1>
        <p className="text-sm text-slate-600 mt-1">Select a saved scenario and ask AI to explain, evaluate risk, and suggest next actions.</p>

        <div className="mt-4 grid gap-2">
          <label className="text-sm font-semibold text-slate-700">Choose Scenario</label>
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            {!scenarios.length ? <option value="">No scenarios found</option> : null}
            {scenarios.map((scenario) => (
              <option key={scenario._id} value={scenario._id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </div>

        {scenarios.length ? (
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">Quick Select</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {scenarios.map((scenario) => {
                const isActive = selectedId === scenario._id;
                return (
                  <button
                    key={scenario._id}
                    type="button"
                    onClick={() => setSelectedId(scenario._id)}
                    className={`rounded-xl border px-3 py-2 text-left transition-all ${
                      isActive
                        ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                        : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    <p className="font-semibold">{scenario.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{scenario?.latestResult?.riskLevel || "No result yet"}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">No saved scenarios yet. Create one in Playground and run simulation first.</p>
        )}
      </section>

      <AiAdvisorPanel scenario={selectedScenario} embedded />
    </AppFrame>
  );
}
