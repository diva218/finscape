import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getScenarioInsights } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function InsightsPanel({ scenarioId }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!scenarioId || !token) {
      setLoading(false);
      setInsights([]);
      setError(null);
      return;
    }

    async function fetchInsights() {
      try {
        setLoading(true);
        setError(null);
        const data = await getScenarioInsights(scenarioId, token);
        setInsights(Array.isArray(data.insights) ? data.insights : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [scenarioId, token]);

  if (loading) {
    return <div className="p-4 text-center text-[#a0898f]">Loading insights...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!insights || insights.length === 0) {
    return <div className="p-4 text-[#a0898f]">No insights available yet</div>;
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">•</span>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{insight}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
