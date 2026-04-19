function ScenarioChip({ scenario, checked, onToggle }) {
  return (
    <label className={`scenario-chip ${checked ? "active" : ""}`}>
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <div>
        <h3>{scenario.title}</h3>
        <p>
          Monthly: {scenario.monthlyCost} | One-time: {scenario.oneTimeCost} | Income delta: {scenario.incomeDelta}
        </p>
      </div>
    </label>
  );
}

export default function ScenarioPanel({ scenarios, activeScenarioIds, onToggle, onSimulate, loading }) {
  return (
    <section className="panel">
      <h2>Scenario Playground</h2>
      <div className="scenario-grid">
        {scenarios.map((scenario) => (
          <ScenarioChip
            key={scenario.id}
            scenario={scenario}
            checked={activeScenarioIds.includes(scenario.id)}
            onToggle={() => onToggle(scenario.id)}
          />
        ))}
      </div>

      <button className="simulate-btn" onClick={onSimulate} disabled={loading}>
        {loading ? "Simulating..." : "Run Future Simulation"}
      </button>
    </section>
  );
}
