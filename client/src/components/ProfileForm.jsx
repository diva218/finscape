function NumberField({ label, value, onChange, min = 0, step = 100 }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export default function ProfileForm({ profile, onChange }) {
  return (
    <section className="panel">
      <h2>Your Monthly Snapshot</h2>
      <div className="fields">
        <NumberField
          label="Monthly Income"
          value={profile.monthlyIncome}
          onChange={(value) => onChange({ ...profile, monthlyIncome: value })}
        />
        <NumberField
          label="Fixed Expenses"
          value={profile.fixedExpenses}
          onChange={(value) => onChange({ ...profile, fixedExpenses: value })}
        />
        <NumberField
          label="Current Bank Balance"
          value={profile.currentBalance}
          onChange={(value) => onChange({ ...profile, currentBalance: value })}
        />
        <label className="field">
          <span>Projection Months ({profile.months})</span>
          <input
            type="range"
            min="1"
            max="12"
            value={profile.months}
            onChange={(event) => onChange({ ...profile, months: Number(event.target.value) })}
          />
        </label>
      </div>
    </section>
  );
}
