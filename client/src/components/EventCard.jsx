import { motion } from "framer-motion";

const tones = [
  "bg-[#ffe8f1]",
  "bg-[#efe8fb]",
  "bg-[#e8f2ff]",
  "bg-[#ecf8ff]"
];

export default function EventCard({ event, index, onDelete, onEdit }) {
  const signedAmount = Number(event.amount) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04, y: -6 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 140, damping: 16 }}
      className={`rounded-3xl border border-pink-100 p-5 shadow-sm transition-all duration-300 ${tones[index % tones.length]}`}
    >
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3.5 }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-base font-bold text-[#7c627f]">{event.name}</p>
            <p className="text-xs text-[#a0898f] mt-1">Month {event.month}</p>
          </div>
          <button 
            onClick={() => onDelete(event.id)}
            className="px-2 py-1 rounded-full text-xs font-semibold text-[#7c627f] bg-white/50 hover:bg-white transition"
          >
            ✕
          </button>
        </div>
        <p className={`mt-3 text-sm font-bold ${signedAmount >= 0 ? "text-[#4b9471]" : "text-[#bf668a]"}`}>
          {signedAmount >= 0 ? "+" : ""}{signedAmount}
        </p>
        {onEdit ? (
          <button
            onClick={() => onEdit(event)}
            className="mt-3 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-semibold text-[#7c627f] transition hover:bg-white"
          >
            Edit
          </button>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
