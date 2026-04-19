import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const palette = ["#d29dbc", "#98bde8", "#c8aad9"];

export default function ScenarioCompareChart({ scenarios = [] }) {
  if (!scenarios.length) {
    return <p className="text-sm text-slate-500">Select 2-3 scenarios to compare.</p>;
  }

  const maxMonths = Math.max(...scenarios.map((item) => item.latestResult?.monthlyBalances?.length || 0));
  const data = Array.from({ length: maxMonths }).map((_, idx) => {
    const point = { month: idx + 1 };
    scenarios.forEach((scenario) => {
      point[scenario.name] = scenario.latestResult?.monthlyBalances?.[idx] ?? null;
    });
    return point;
  });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.22} stroke="#dbc7e3" />
          <XAxis dataKey="month" tick={{ fill: "#8d7598" }} />
          <YAxis width={82} tick={{ fill: "#8d7598" }} />
          <Tooltip />
          <Legend />
          {scenarios.map((scenario, index) => (
            <Line
              key={scenario._id}
              type="monotone"
              dataKey={scenario.name}
              stroke={palette[index % palette.length]}
              strokeWidth={3}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
