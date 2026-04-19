import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload || {};

  return (
    <div className="rounded-xl border border-[#d6bfdc] bg-white/95 px-3 py-2 text-sm shadow">
      <p>Month {label}</p>
      <p className="font-semibold">Balance: {Math.round(payload[0].value)}</p>
      <p className="cute-subtext text-xs">Event Impact: {point.eventCause || "None"}</p>
    </div>
  );
}

export default function SimulationChart({ monthlyBalances = [], points, color = "#0f766e" }) {
  const data = points || monthlyBalances.map((balance, index) => ({ month: index + 1, balance, eventCause: "None" }));

  if (!data.length) {
    return <p className="text-sm text-slate-500">No simulation data yet.</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="h-[280px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="finscapeArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffb3c6" stopOpacity={0.65} />
              <stop offset="100%" stopColor="#a2d2ff" stopOpacity={0.12} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8c7df" opacity={0.45} />
          <XAxis dataKey="month" tick={{ fill: "#8c7696" }} />
          <YAxis width={82} tick={{ fill: "#8c7696" }} />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#c79abb"
            strokeWidth={3}
            fill="url(#finscapeArea)"
            isAnimationActive
            animationDuration={1200}
            dot={(dotProps) => {
              const hasEvent = dotProps?.payload?.eventCause && dotProps.payload.eventCause !== "None";
              return (
                <circle
                  cx={dotProps.cx}
                  cy={dotProps.cy}
                  r={hasEvent ? 4.5 : 2.5}
                  fill={hasEvent ? "#d877a2" : "#c8aacf"}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
