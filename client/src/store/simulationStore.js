import { create } from "zustand";

const initialInputs = {
  income: 90000,
  fixedExpenses: 38000,
  emi: 12000,
  rentChange: 5000,
  lifestyleUpgrade: 4000,
  initialBalance: 180000,
  months: 12,
  toggles: {
    jobLoss: false,
    medicalExpense: false
  },
  events: [
    {
      name: "Vacation cost",
      month: 4,
      amount: 25000,
      recurring: false
    }
  ]
};

export const useSimulationStore = create((set) => ({
  activePersonality: "moderate",
  scenarioName: "Primary Plan",
  inputs: initialInputs,
  latestResult: null,
  scenarios: [],
  comparedScenarioIds: [],
  setScenarioName: (scenarioName) => set({ scenarioName }),
  setActivePersonality: (activePersonality) => set({ activePersonality }),
  updateInputs: (patch) => set((state) => ({ inputs: { ...state.inputs, ...patch } })),
  updateToggles: (patch) => set((state) => ({ inputs: { ...state.inputs, toggles: { ...state.inputs.toggles, ...patch } } })),
  setEvents: (events) => set((state) => ({ inputs: { ...state.inputs, events } })),
  setLatestResult: (latestResult) => set({ latestResult }),
  setScenarios: (scenarios) => set({ scenarios }),
  setComparedScenarioIds: (comparedScenarioIds) => set({ comparedScenarioIds })
}));
