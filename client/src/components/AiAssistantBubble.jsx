import { motion } from "framer-motion";

const moods = {
  calm: {
    icon: "✓",
    badge: "Stable",
    title: "Plan Status: Healthy",
    line: "Your scenario shows sustainable metrics. Continue monitoring."
  },
  alert: {
    icon: "!",
    badge: "Caution",
    title: "Plan Status: At Risk",
    line: "Financial pressure detected. Consider adjusting your inputs."
  },
  danger: {
    icon: "⚠",
    badge: "Critical",
    title: "Plan Status: Unstable",
    line: "Risk levels exceed safe thresholds. Immediate action recommended."
  }
};

function getMood(stressScore) {
  if (stressScore >= 75) {
    return "danger";
  }

  if (stressScore >= 45) {
    return "alert";
  }

  return "calm";
}

export default function AiAssistantBubble({ stressScore, loading }) {
  const moodKey = getMood(stressScore ?? 0);
  const mood = moods[moodKey];

  return (
    <motion.article
      className={`rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className={`rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold ${
            moodKey === 'calm' ? 'bg-emerald-100 text-emerald-700' :
            moodKey === 'alert' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {mood.icon}
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            moodKey === 'calm' ? 'bg-emerald-100 text-emerald-700' :
            moodKey === 'alert' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {mood.badge}
          </span>
        </div>

        <div>
          <p className="font-semibold text-indigo-900">{mood.title}</p>
          <p className="text-sm text-slate-600 mt-1">{loading ? "Analyzing your scenario..." : mood.line}</p>
        </div>
      </div>
    </motion.article>
  );
}
