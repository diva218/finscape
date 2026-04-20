import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { analyzeScenarioWithAi, runSimulation } from "../api/client";
import { useAuth } from "../context/AuthContext";

function buildAiPayload(user, scenario, question = "") {
  const inputs = scenario?.inputs || {};
  const latestResult = scenario?.latestResult || {};

  return {
    profile: {
      income: Number(inputs.income ?? user?.income ?? 0) || 0,
      expenses:
        Number(inputs.fixedExpenses ?? 0)
        + Number(inputs.emi ?? 0)
        + Number(inputs.investments ?? 0)
        + Number(inputs.discretionarySpend ?? 0)
    },
    events: Array.isArray(inputs.events)
      ? inputs.events.map((event) => ({
          name: event?.name,
          amount: Number(event?.amount) || 0,
          month: Number(event?.month) || 1
        }))
      : [],
    simulation: {
      monthlyBalances: Array.isArray(latestResult.monthlyBalances) ? latestResult.monthlyBalances : [],
      finalBalance: Number(latestResult.finalBalance || 0),
      stressScore: Number(latestResult.stressScore || 0),
      riskLevel: latestResult.riskLevel || "UNKNOWN"
    },
    question
  };
}

export default function AiAdvisorPanel({ scenario, embedded = false }) {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(embedded);

  const canAnalyze = useMemo(() => {
    return Boolean(scenario);
  }, [scenario]);

  async function buildSimulationForAi() {
    const existing = scenario?.latestResult;
    if (Array.isArray(existing?.monthlyBalances) && existing.monthlyBalances.length > 0) {
      return {
        monthlyBalances: existing.monthlyBalances,
        finalBalance: Number(existing.finalBalance || 0),
        stressScore: Number(existing.stressScore || 0),
        riskLevel: existing.riskLevel || "UNKNOWN"
      };
    }

    const inputs = scenario?.inputs || {};
    const simulated = await runSimulation(
      {
        income: Number(inputs.income) || 0,
        fixedExpenses: Number(inputs.fixedExpenses) || 0,
        emi: Number(inputs.emi) || 0,
        investments: Number(inputs.investments) || 0,
        discretionarySpend: Number(inputs.discretionarySpend) || 0,
        initialBalance: Number(inputs.initialBalance) || 0,
        months: Number(inputs.months) || 12,
        events: Array.isArray(inputs.events)
          ? inputs.events.map((event) => ({
              name: event?.name,
              amount: Number(event?.amount) || 0,
              month: Number(event?.month) || 1
            }))
          : []
      },
      token
    );

    return {
      monthlyBalances: Array.isArray(simulated?.monthlyBalances) ? simulated.monthlyBalances : [],
      finalBalance: Number(simulated?.finalBalance || 0),
      stressScore: Number(simulated?.stressScore || 0),
      riskLevel: simulated?.riskLevel || "UNKNOWN"
    };
  }

  async function askAi(customQuestion = "") {
    if (!token) {
      setError("Please login again to use AI advisor.");
      return;
    }

    if (!scenario) {
      setError("Please select a scenario first.");
      return;
    }

    setLoading(true);
    setError("");
    let computedSimulation = null;

    try {
      const prompt = customQuestion || "Explain my scenario, identify risks, and suggest actions.";
      computedSimulation = await buildSimulationForAi();
      if (!Array.isArray(computedSimulation.monthlyBalances) || computedSimulation.monthlyBalances.length === 0) {
        throw new Error("Unable to generate simulation for this scenario.");
      }

      const payload = buildAiPayload(user, { ...scenario, latestResult: computedSimulation }, prompt);
      const response = await analyzeScenarioWithAi(payload, token);

      const nextMessages = [];
      if (customQuestion) {
        nextMessages.push({ role: "user", text: customQuestion });
      }

      const structuredAnswer = [
        response.explanation ? `Scenario Summary\n${response.explanation}` : "",
        Array.isArray(response.risks) && response.risks.length
          ? `Risks\n${response.risks.map((item) => `- ${item}`).join("\n")}`
          : "",
        Array.isArray(response.suggestions) && response.suggestions.length
          ? `Suggestions\n${response.suggestions.map((item) => `- ${item}`).join("\n")}`
          : ""
      ]
        .filter(Boolean)
        .join("\n\n");

      nextMessages.push({ role: "assistant", text: structuredAnswer || response.analysis });

      setMessages((prev) => [...prev, ...nextMessages]);
      setQuestion("");
    } catch (err) {
      setError(err.message || "Unable to get AI analysis right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open ? (
        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={
            embedded
              ? "mt-4 w-full rounded-2xl bg-white p-4 shadow-sm border border-slate-200"
              : "fixed bottom-24 right-6 z-50 w-[min(92vw,420px)] rounded-2xl bg-white p-4 shadow-xl border border-slate-200"
          }
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI Financial Advisor</h3>
              <p className="text-xs text-slate-500">Dynamic analysis from your real simulation data</p>
            </div>
            {!embedded ? (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => askAi("")}
            disabled={loading || !canAnalyze}
            className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Explain My Scenario"}
          </button>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 h-64 overflow-y-auto space-y-3">
            {!messages.length ? (
              <p className="text-sm text-slate-500">Ask AI to explain your scenario, identify risks, or suggest improvements.</p>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={`${message.role}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    message.role === "user"
                      ? "ml-auto max-w-[85%] bg-indigo-100 text-indigo-900"
                      : "mr-auto max-w-[95%] bg-white border border-slate-200 text-slate-700"
                  }`}
                >
                  {message.text}
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask: What is my biggest risk in month 6?"
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => askAi(question.trim())}
              disabled={loading || !question.trim()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold transition disabled:opacity-60"
            >
              Send
            </button>
          </div>

          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </motion.section>
      ) : null}

      {!embedded ? (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all duration-300 hover:-translate-y-1"
          title="Open AI Financial Advisor"
        >
          AI
        </button>
      ) : null}
    </>
  );
}
