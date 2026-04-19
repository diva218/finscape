import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getRecommendations } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function RecommendationsPanel() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    async function fetchRecommendations() {
      try {
        setLoading(true);
        const data = await getRecommendations(token);
        setRecommendations(data.recommendations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [token]);

  if (loading) {
    return <div className="p-4 text-center text-[#a0898f]">Analyzing scenarios...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!recommendations) {
    return <div className="p-4 text-[#a0898f]">Create scenarios to get recommendations</div>;
  }

  return (
    <div className="space-y-6">
      {recommendations.scoringMethod ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-600">HOW SCORING WORKS</p>
          <p className="mt-1 text-sm text-slate-700">{recommendations.scoringMethod}</p>
        </div>
      ) : null}

      {/* Best Scenario */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-pink-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🏆</span>
          <h3 className="text-lg font-bold text-[#7c627f]">Best Scenario</h3>
        </div>
        <p className="text-xl font-bold text-[#7c627f] mb-2">
          {recommendations.bestScenario.name}
        </p>
        <p className="text-sm text-[#a0898f] mb-4">
          {recommendations.bestScenario.reason}
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white rounded-lg p-3">
            <p className="text-[#a0898f]">Stress Score</p>
            <p className="text-xl font-bold text-[#7c627f]">
              {recommendations.bestScenario.stressScore.toFixed(1)}/10
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-[#a0898f]">Savings Rate</p>
            <p className="text-xl font-bold text-green-600">
              {recommendations.bestScenario.savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </motion.div>

      {/* Alternatives */}
      {recommendations.alternatives && recommendations.alternatives.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-[#7c627f] mb-3">Alternatives to Consider</h3>
          <div className="space-y-2">
            {recommendations.alternatives.map((alt, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx + 1) * 0.1 }}
                className="rounded-2xl border border-pink-100 bg-white p-4"
              >
                <p className="font-semibold text-[#7c627f]">{alt.name}</p>
                <p className="text-sm text-[#a0898f]">{alt.reason}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {recommendations.personalizedTips && recommendations.personalizedTips.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-[#7c627f] mb-3">Personalized Tips</h3>
          <div className="space-y-2">
            {recommendations.personalizedTips.map((tip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx + 1) * 0.1 }}
                className="rounded-2xl border border-blue-100 bg-blue-50 p-4 flex items-start gap-3"
              >
                <span className="text-xl">💡</span>
                <p className="text-sm text-[#7c627f]">{tip}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {recommendations.scenarioScores && recommendations.scenarioScores.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-[#7c627f] mb-3">Scenario Scoreboard</h3>
          <div className="space-y-2">
            {recommendations.scenarioScores.map((item, idx) => (
              <div key={`${item.name}-${idx}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="text-sm font-bold text-indigo-700">Score: {item.score}</p>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Stress: {item.stressScore}/10 | Savings: {item.savingsRate}% | Final Balance: {item.finalBalance}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
