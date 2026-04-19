import { AnimatePresence, motion } from "framer-motion";
import AiAssistantBubble from "./AiAssistantBubble";
import BalanceChart from "./BalanceChart";
import RiskBadge from "./RiskBadge";

export default function ResultsPanel({ result, loading, error }) {
  const stressScore = result?.summary?.stressScore ?? 0;

  return (
    <section className="panel results">
      <h2>Simulation Outcome</h2>
      <AiAssistantBubble stressScore={stressScore} loading={loading} />
      {loading && <p className="muted">Crunching numbers...</p>}
      {error && <p className="error">{error}</p>}

      <AnimatePresence mode="wait">
        {result?.summary && (
          <motion.div
            key={`${result.summary.endingBalance}-${result.summary.stressScore}`}
            className="result-grid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <article>
              <h3>Future Bank Balance</h3>
              <p className="big-number">{result.summary.endingBalance}</p>
              <p className="muted">Monthly net: {result.summary.monthlyNet}</p>
            </article>
            <article>
              <h3>Stress Score</h3>
              <p className="big-number">{result.summary.stressScore}/100</p>
              <div className="meter">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${result.summary.stressScore}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </article>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="warnings">
        <h3>Risk Warnings</h3>
        {result?.riskWarnings?.length ? (
          result.riskWarnings.map((warning, index) => (
            <RiskBadge key={`${warning.level}-${index}`} level={warning.level} message={warning.message} />
          ))
        ) : (
          <p className="muted">No warnings yet.</p>
        )}
      </div>

      <div className="trend">
        <h3>Balance Trend</h3>
        <BalanceChart timeline={result?.timeline} />
      </div>
    </section>
  );
}
