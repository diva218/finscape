import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createScenario, getInlineInsights, getScenariosByUser, runSimulation, updateScenarioById } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSimulationStore } from "../store/simulationStore";
import AddEventModal from "./AddEventModal";
import EventCard from "./EventCard";
import Timeline from "./Timeline";
import AiGuidancePanel from "./AiGuidancePanel";
import SimulationChart from "./SimulationChart";
import { HiQuestionMarkCircle } from "react-icons/hi2";

const seedEvents = [];

const initialInputs = {
  scenarioName: "",
  income: 90000,
  fixedExpenses: 38000,
  emi: 12000,
  investments: 8000,
  discretionarySpend: 6000,
  initialBalance: 120000,
  months: 12
};

const DRAFT_STORAGE_KEY_PREFIX = "finscape_playground_draft";

function toPersonalityMode(type) {
  if (type === "Conservative") return "conservative";
  if (type === "Risky") return "aggressive";
  return "moderate";
}

export default function ScenarioCanvas({ personalityType = "Balanced" }) {
  const [events, setEvents] = useState(seedEvents);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState("");
  const [initializedDraft, setInitializedDraft] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [inputs, setInputs] = useState(initialInputs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [guidanceField, setGuidanceField] = useState(null);
  const [errors, setErrors] = useState({});
  const [editingEvent, setEditingEvent] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulationInsights, setSimulationInsights] = useState([]);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationError, setSimulationError] = useState("");
  const { token, user } = useAuth();
  const { setScenarios } = useSimulationStore();
  const navigate = useNavigate();
  const draftStorageKey = useMemo(
    () => `${DRAFT_STORAGE_KEY_PREFIX}:${user?._id || "anonymous"}`,
    [user?._id]
  );

  function toDraftFromScenario(scenario) {
    const scenarioInputs = scenario?.inputs || {};
    const nextInputs = {
      ...initialInputs,
      scenarioName: scenario?.name || "",
      income: Number(scenarioInputs.income ?? initialInputs.income) || 0,
      fixedExpenses: Number(scenarioInputs.fixedExpenses ?? initialInputs.fixedExpenses) || 0,
      emi: Number(scenarioInputs.emi ?? initialInputs.emi) || 0,
      investments: Number(scenarioInputs.investments ?? initialInputs.investments) || 0,
      discretionarySpend: Number(scenarioInputs.discretionarySpend ?? initialInputs.discretionarySpend) || 0,
      initialBalance: Number(scenarioInputs.initialBalance ?? initialInputs.initialBalance) || 0,
      months: Number(scenarioInputs.months ?? initialInputs.months) || 12
    };

    const nextEvents = Array.isArray(scenarioInputs.events)
      ? scenarioInputs.events.map((event, idx) => ({
          id: event.id || `${scenario._id || "scenario"}-${idx}`,
          name: event.name,
          amount: Number(event.amount) || 0,
          month: Number(event.month) || 1
        }))
      : [];

    return { inputs: nextInputs, events: nextEvents };
  }

  function startNewScenario() {
    setSelectedScenarioId("");
    setInputs({ ...initialInputs, scenarioName: "" });
    setEvents([]);
    setErrors({});
    setError("");
  }

  function loadScenarioDraft(scenarioId) {
    const scenario = savedScenarios.find((item) => item._id === scenarioId);
    if (!scenario) return;
    const nextDraft = toDraftFromScenario(scenario);
    setInputs(nextDraft.inputs);
    setEvents(nextDraft.events);
    setErrors({});
    setError("");
    setSelectedScenarioId(scenarioId);
  }

  const summary = useMemo(() => {
    const totalImpact = events.reduce((acc, event) => acc + (Number(event.amount) || 0), 0);
    const eventCount = events.length;
    return { totalImpact, eventCount };
  }, [events]);

  const smartSuggestions = useMemo(() => {
    const lines = [];
    const monthlyNet = Number(inputs.income) - (Number(inputs.fixedExpenses) + Number(inputs.emi) + Number(inputs.investments) + Number(inputs.discretionarySpend));
    const monthlyOutflow = Number(inputs.fixedExpenses) + Number(inputs.emi) + Number(inputs.investments) + Number(inputs.discretionarySpend);
    const initialBalance = Number(inputs.initialBalance) || 0;
    const months = Number(inputs.months) || 12;
    const expenseEvents = events.filter((event) => Number(event.amount) < 0);
    const totalEventOutflow = Math.abs(expenseEvents.reduce((sum, event) => sum + (Number(event.amount) || 0), 0));

    if (monthlyNet < 0) {
      lines.push("Your monthly plan is negative. Reduce discretionary spend or EMI before adding new expenses.");
    } else if (monthlyNet < 10000) {
      lines.push("Your monthly surplus is thin. Keep at least 10k buffer for unpredictable costs.");
    } else {
      lines.push("Healthy monthly surplus detected. You can test larger goals with lower risk.");
    }

    const emiRatio = Number(inputs.income) > 0 ? Number(inputs.emi) / Number(inputs.income) : 0;
    if (emiRatio > 0.35) {
      lines.push("EMI is above 35% of income. Consider refinancing or lowering loan burden.");
    }

    if (Number(inputs.investments) < Number(inputs.income) * 0.1) {
      lines.push("Investment contribution is below 10% of income. Increase it for better long-term safety.");
    }

    if (monthlyOutflow > 0) {
      const bufferMonths = initialBalance / monthlyOutflow;
      if (bufferMonths < 3) {
        lines.push("Emergency reserve is under 3 months of expenses. Build a safety buffer before high-risk decisions.");
      } else if (bufferMonths >= 6) {
        lines.push("Emergency reserve covers 6+ months. Good downside protection for uncertain months.");
      }
    }

    if (expenseEvents.length >= 3 && totalEventOutflow > (Number(inputs.income) || 0) * 1.5) {
      lines.push("Planned one-time events are heavy versus income. Try spreading them across more months.");
    }

    if (months < 6) {
      lines.push("Projection window is short. Increase to at least 6-12 months for a more realistic trend.");
    }

    return lines.slice(0, 6);
  }, [events, inputs]);

  const actionSuggestions = useMemo(() => {
    const monthlyNet = Number(inputs.income) - (Number(inputs.fixedExpenses) + Number(inputs.emi) + Number(inputs.investments) + Number(inputs.discretionarySpend));
    const discretionary = Number(inputs.discretionarySpend) || 0;
    const income = Number(inputs.income) || 0;
    const monthCap = Math.max(1, Number(inputs.months) || 12);

    const emergencyTopUp = Math.max(5000, Math.round((Number(inputs.fixedExpenses) + Number(inputs.emi)) * 0.5));
    const sideHustle = Math.max(3000, Math.round(income * 0.08));
    const insuranceShock = -Math.max(6000, Math.round((Number(inputs.fixedExpenses) + discretionary) * 0.35));

    const tripAmount = -Math.min(45000, Math.max(7000, Math.round(Math.abs(monthlyNet > 0 ? monthlyNet * 0.45 : (Number(inputs.income) || 30000) * 0.15))));
    const gadgetAmount = -Math.min(35000, Math.max(4000, Math.round(discretionary > 0 ? discretionary * 1.4 : (Number(inputs.income) || 20000) * 0.08)));

    return [
      {
        id: "plan-trip",
        title: "Trip",
        description: `Add travel event: ${tripAmount} in month 5`,
        event: {
          name: "Trip",
          amount: tripAmount,
          month: Math.min(5, monthCap)
        }
      },
      {
        id: "buy-gadget",
        title: "Gadget",
        description: `Add purchase event: ${gadgetAmount} in month 2`,
        event: {
          name: "Gadget",
          amount: gadgetAmount,
          month: Math.min(2, monthCap)
        }
      },
      {
        id: "emergency-fund-topup",
        title: "Emergency Fund Top-up",
        description: `Add reserve boost: +${emergencyTopUp} in month 1`,
        event: {
          name: "Emergency Fund Top-up",
          amount: emergencyTopUp,
          month: 1
        }
      },
      {
        id: "side-hustle-income",
        title: "Side Hustle",
        description: `Add extra income: +${sideHustle} in month 3`,
        event: {
          name: "Side Hustle",
          amount: sideHustle,
          month: Math.min(3, monthCap)
        }
      },
      {
        id: "insurance-surprise",
        title: "Insurance Surprise",
        description: `Stress test with a surprise bill: ${insuranceShock} in month 4`,
        event: {
          name: "Insurance Surprise",
          amount: insuranceShock,
          month: Math.min(4, monthCap)
        }
      }
    ];
  }, [inputs]);

  async function fetchSimulation(nextInputs = inputs, nextEvents = events) {
    if (!token) return;

    setSimulationLoading(true);
    setSimulationError("");

    try {
      const result = await runSimulation(
        {
          income: Number(nextInputs.income) || 0,
          fixedExpenses: Number(nextInputs.fixedExpenses) || 0,
          emi: Number(nextInputs.emi) || 0,
          investments: Number(nextInputs.investments) || 0,
          discretionarySpend: Number(nextInputs.discretionarySpend) || 0,
          initialBalance: Number(nextInputs.initialBalance) || 0,
          months: Number(nextInputs.months) || 12,
          events: nextEvents.map((event) => ({
            name: event.name,
            amount: Number(event.amount) || 0,
            month: Number(event.month) || 1
          }))
        },
        token
      );

      setSimulationResult(result);

      const insightsPayload = {
        monthlyBalances: result.monthlyBalances || [],
        income: Number(nextInputs.income) || 0,
        expenses:
          (Number(nextInputs.fixedExpenses) || 0)
          + (Number(nextInputs.emi) || 0)
          + (Number(nextInputs.investments) || 0)
          + (Number(nextInputs.discretionarySpend) || 0),
        finalBalance: Number(result.finalBalance || 0),
        stressScore: Number(result.stressScore || 0)
      };

      const insightResponse = await getInlineInsights(insightsPayload, token);
      setSimulationInsights(Array.isArray(insightResponse.insights) ? insightResponse.insights : []);
    } catch (simulationErr) {
      setSimulationError(simulationErr.message || "Unable to load live simulation.");
      setSimulationInsights([]);
    } finally {
      setSimulationLoading(false);
    }
  }

  function buildScenarioPayload() {
    return {
      name: inputs.scenarioName?.trim(),
      income: Number(inputs.income) || 0,
      expenses:
        (Number(inputs.fixedExpenses) || 0)
        + (Number(inputs.emi) || 0)
        + (Number(inputs.investments) || 0)
        + (Number(inputs.discretionarySpend) || 0),
      events: events.map((event) => ({
        name: event.name,
        month: Number(event.month) || 1,
        amount: Number(event.amount) || 0
      })),
      financialPersonality: toPersonalityMode(personalityType),
      inputs: {
        income: Number(inputs.income) || 0,
        fixedExpenses: Number(inputs.fixedExpenses) || 0,
        emi: Number(inputs.emi) || 0,
        investments: Number(inputs.investments) || 0,
        discretionarySpend: Number(inputs.discretionarySpend) || 0,
        initialBalance: Number(inputs.initialBalance) || 0,
        months: Number(inputs.months) || 12,
        events: events.map((event) => ({
          name: event.name,
          month: Number(event.month) || 1,
          amount: Number(event.amount) || 0
        })),
        toggles: {
          jobLoss: false,
          medicalExpense: false
        }
      }
    };
  }

  async function saveOrUpdateScenario(tokenValue, shouldNavigateAfterSave = false) {
    const payload = buildScenarioPayload();
    const hasSelectedScenario = Boolean(selectedScenarioId);

    const savedScenario = hasSelectedScenario
      ? await updateScenarioById(selectedScenarioId, payload, tokenValue)
      : await createScenario(payload, tokenValue);

    const refreshedScenarios = await getScenariosByUser(tokenValue);
    const safeScenarios = Array.isArray(refreshedScenarios) ? refreshedScenarios : [];
    setSavedScenarios(safeScenarios);
    setScenarios(safeScenarios);

    if (savedScenario?._id) {
      setSelectedScenarioId(savedScenario._id);
    }

    if (shouldNavigateAfterSave) {
      navigate("/simulation");
    }

    return savedScenario;
  }

  useEffect(() => {
    if (!token) return;

    getScenariosByUser(token)
      .then((items) => {
        const safeItems = Array.isArray(items) ? items : [];
        setSavedScenarios(safeItems);
        setScenarios(safeItems);

        if (!initializedDraft) {
          let restored = null;
          try {
            const raw = localStorage.getItem(draftStorageKey);
            restored = raw ? JSON.parse(raw) : null;
          } catch (_err) {
            restored = null;
          }

          if (restored?.inputs) {
            setInputs({ ...initialInputs, ...restored.inputs });
            setEvents(Array.isArray(restored.events) ? restored.events : []);
            setSelectedScenarioId(restored.selectedScenarioId || "");
          } else if (safeItems.length) {
            const latest = safeItems[0];
            const nextDraft = toDraftFromScenario(latest);
            setInputs(nextDraft.inputs);
            setEvents(nextDraft.events);
            setSelectedScenarioId(latest._id);
          }

          setInitializedDraft(true);
        }
      })
      .catch(() => {
        if (!initializedDraft) {
          setInitializedDraft(true);
        }
      });
  }, [token, draftStorageKey]);

  useEffect(() => {
    // Reset initialization when the authenticated user changes, so each user loads their own draft.
    setInitializedDraft(false);
  }, [draftStorageKey]);

  useEffect(() => {
    if (!initializedDraft) return;

    const payload = {
      inputs,
      events,
      selectedScenarioId
    };

    localStorage.setItem(draftStorageKey, JSON.stringify(payload));
  }, [inputs, events, selectedScenarioId, initializedDraft, draftStorageKey]);

  useEffect(() => {
    if (!token || !initializedDraft) return;

    const timer = setTimeout(() => {
      fetchSimulation(inputs, events);
    }, 250);

    return () => clearTimeout(timer);
  }, [token, inputs, events, initializedDraft]);

  function handleAddEvent(newEvent) {
    setEvents((prev) => {
      const nextEvents = [newEvent, ...prev];
      fetchSimulation(inputs, nextEvents);
      return nextEvents;
    });
  }

  function handleUpdateEvent(updatedEvent) {
    setEvents((prev) => {
      const nextEvents = prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event));
      fetchSimulation(inputs, nextEvents);
      return nextEvents;
    });
    setEditingEvent(null);
  }

  function handleDeleteEvent(id) {
    setEvents((prev) => {
      const nextEvents = prev.filter((event) => event.id !== id);
      fetchSimulation(inputs, nextEvents);
      return nextEvents;
    });
  }

  function applySuggestion(suggestion) {
    const suggestedEvent = {
      id: crypto.randomUUID(),
      name: suggestion.event.name,
      amount: suggestion.event.amount,
      month: suggestion.event.month
    };

    handleAddEvent(suggestedEvent);
  }

  function updateInput(key, value) {
    setInputs((prev) => ({ ...prev, [key]: value }));

    const newErrors = { ...errors };
    const numVal = Number(value);

    if (['income', 'fixedExpenses', 'emi', 'investments', 'discretionarySpend', 'initialBalance', 'months'].includes(key)) {
      if (numVal < 0) {
        newErrors[key] = "Value cannot be negative";
      } else {
        delete newErrors[key];
      }
    }

    if (key === 'income' || key === 'fixedExpenses' || key === 'emi' || key === 'investments' || key === 'discretionarySpend') {
      const totalExpenses = Number(inputs.fixedExpenses) + Number(inputs.emi) + Number(inputs.investments) + Number(inputs.discretionarySpend);
      const income = key === 'income' ? numVal : Number(inputs.income);

      if (totalExpenses > income && income > 0) {
        newErrors['expenses'] = `Monthly expenses (₹${totalExpenses}) exceed income (₹${income})`;
      } else {
        delete newErrors['expenses'];
      }
    }
    
    setErrors(newErrors);
  }

  async function handleRunSimulation() {
    if (!token) {
      setError("Authentication token missing. Please log in again.");
      return;
    }

    if (!inputs.scenarioName?.trim()) {
      setError("Please enter a scenario name before running the simulation.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await saveOrUpdateScenario(token, false);
      setSuccessMessage("Scenario saved successfully. Opening simulation view...");
      navigate("/simulation");
    } catch (err) {
      setError(err.message || "Unable to run simulation right now.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveScenarioOnly() {
    if (!token) {
      setError("Authentication token missing. Please log in again.");
      return;
    }

    if (!inputs.scenarioName?.trim()) {
      setError("Please enter a scenario name before saving.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await saveOrUpdateScenario(token, false);
      setSuccessMessage("Scenario saved. You can keep editing or run simulation now.");
    } catch (err) {
      setError(err.message || "Unable to save scenario right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="space-y-6"
    >
      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-6 hover-lift">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-1">Build Your Scenario</h2>
          <p className="text-slate-500">Design your financial story with interactive event blocks.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-2">
            <p className="text-xs text-slate-500">Events: {summary.eventCount}</p>
            <p className={`text-sm font-bold ${summary.totalImpact >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              Impact: {summary.totalImpact >= 0 ? "+" : ""}{summary.totalImpact}
            </p>
          </div>
          <button
            onClick={() => setOpenModal(true)}
            className="px-6 py-2 rounded-full bg-slate-200 hover:bg-slate-300 hover:-translate-y-1 transition-all duration-300 font-semibold text-slate-800"
          >
            Add Event
          </button>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover-lift">
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm min-w-[240px]">
            <span className="text-slate-600 font-semibold">Load Previous Scenario</span>
            <select
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
              className="cute-input transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <option value="">Select a saved scenario</option>
              {savedScenarios.map((scenario) => (
                <option key={scenario._id} value={scenario._id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => loadScenarioDraft(selectedScenarioId)}
            disabled={!selectedScenarioId}
            className="px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-200 hover:shadow-sm disabled:opacity-50 disabled:hover:translate-y-0"
          >
            Load
          </button>

          <button
            type="button"
            onClick={startNewScenario}
            className="px-4 py-2 rounded-full bg-slate-200 text-slate-800 font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-slate-300 hover:shadow-sm"
          >
            Start New Scenario
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Your current draft is auto-saved in Playground, so switching pages will not wipe entered values.</p>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover-lift">
        <h3 className="text-lg font-bold text-slate-800">Financial Inputs</h3>
        {errors.expenses && (
          <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700 font-medium">{errors.expenses}</p>
          </div>
        )}
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["scenarioName", "Scenario Name", "text"],
            ["income", "Monthly Income", "number"],
            ["fixedExpenses", "Fixed Expenses", "number"],
            ["emi", "Loans / EMI", "number"],
            ["investments", "Investments", "number"],
            ["discretionarySpend", "Lifestyle / Other Spend", "number"],
            ["initialBalance", "Starting Balance", "number"],
            ["months", "Projection Months", "number"]
          ].map(([key, label, type]) => (
            <label key={key} className="grid gap-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">{label}</span>
                <button
                  type="button"
                  onClick={() => setGuidanceField(key)}
                  className="text-indigo-600 hover:text-indigo-700 transition-colors"
                  title="Get guidance"
                >
                  <HiQuestionMarkCircle className="w-4 h-4" />
                </button>
              </div>
              <input
                type={type}
                value={inputs[key]}
                onChange={(e) => updateInput(key, type === "number" ? Number(e.target.value) : e.target.value)}
                className={`cute-input ${errors[key] ? 'border-red-500' : ''}`}
              />
              {errors[key] && <p className="text-red-600 text-xs mt-1">{errors[key]}</p>}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover-lift">
        <h3 className="text-lg font-bold text-slate-800">Smart Suggestion Bar</h3>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {smartSuggestions.map((line) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="w-full md:w-[48%] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 transition-all duration-300"
            >
              {line}
            </motion.p>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {actionSuggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => applySuggestion(suggestion)}
              className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-100"
            >
              <p className="font-semibold text-indigo-900">{suggestion.title}</p>
              <p className="mt-1 text-sm text-indigo-700">{suggestion.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover-lift">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Live Balance Graph</h3>
            <p className="text-sm text-slate-500">Updates automatically from the backend simulation using your current inputs and events.</p>
          </div>
          <p className="text-sm font-semibold text-slate-600">
            {simulationLoading ? "Refreshing..." : simulationResult ? `Risk: ${simulationResult.riskLevel}` : "Waiting for simulation..."}
          </p>
        </div>
        {simulationError ? <p className="mt-3 text-sm text-rose-600">{simulationError}</p> : null}
        <div className="mt-4">
          <SimulationChart monthlyBalances={simulationResult?.monthlyBalances || []} />
        </div>
        {simulationInsights.length ? (
          <div className="mt-4 space-y-2">
            {simulationInsights.map((line) => (
              <p key={line} className="text-sm text-slate-700">
                - {line}
              </p>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover-lift">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} onDelete={handleDeleteEvent} onEdit={(eventToEdit) => {
              setEditingEvent(eventToEdit);
              setOpenModal(true);
            }} />
          ))}
        </div>
      </section>

      <Timeline events={events} />

      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4 hover-lift">
        <div>
          <p className="text-sm text-slate-500">Decision Runner</p>
          <p className="text-slate-800 font-semibold">Create scenario, run live simulation, and open comparison view.</p>
          {error ? <p className="text-sm text-rose-600 mt-2">{error}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-700 mt-2">{successMessage}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSaveScenarioOnly}
            disabled={loading}
            className="px-6 py-3 rounded-full bg-indigo-100 text-indigo-800 hover:bg-indigo-200 hover:-translate-y-1 transition-all duration-300 font-semibold disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? "Saving..." : "Save Scenario"}
          </button>
          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="px-6 py-3 rounded-full bg-slate-200 hover:bg-slate-300 hover:-translate-y-1 transition-all duration-300 font-semibold text-slate-800 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? "Running..." : "Run Simulation"}
          </button>
        </div>
      </section>

      <AddEventModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingEvent(null);
        }}
        onAdd={handleAddEvent}
        onUpdate={handleUpdateEvent}
        initialEvent={editingEvent}
      />
      <AiGuidancePanel field={guidanceField} onClose={() => setGuidanceField(null)} />
    </motion.div>
  );
}
