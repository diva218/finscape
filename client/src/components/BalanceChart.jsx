import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

function MoneyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="chart-tooltip">
      <p>Month {label}</p>
      <strong>{Math.round(payload[0].value)}</strong>
    </div>
  );
}

export default function BalanceChart({ timeline }) {
  if (!timeline?.length) {
    return <p className="muted">Run a simulation to unlock your future balance chart.</p>;
  }

  return (
    <motion.div
      className="chart-wrap"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={timeline} margin={{ top: 16, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceFlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff98be" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#b9f1da" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1d1f22" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={72} />
          <Tooltip content={<MoneyTooltip />} />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#ff6d8e"
            strokeWidth={3}
            fill="url(#balanceFlow)"
            isAnimationActive
            animationDuration={950}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
