import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CuteButton from "./CuteButton";

const initialDraft = { name: "", amount: "", month: 1 };

export default function AddEventModal({ open, onClose, onAdd, onUpdate, initialEvent }) {
  const [draft, setDraft] = useState(initialDraft);

  useEffect(() => {
    if (!open) {
      setDraft(initialDraft);
      return;
    }

    if (initialEvent) {
      setDraft({
        name: initialEvent.name || "",
        amount: String(initialEvent.amount ?? ""),
        month: Math.max(1, Math.min(12, Number(initialEvent.month) || 1))
      });
      return;
    }

    setDraft(initialDraft);
  }, [open, initialEvent]);

  function handleSubmit(event) {
    event.preventDefault();

    const next = {
      id: crypto.randomUUID(),
      name: draft.name.trim(),
      amount: Number(draft.amount) || 0,
      month: Math.max(1, Math.min(12, Number(draft.month) || 1))
    };

    if (!next.name) return;

    if (initialEvent && onUpdate) {
      onUpdate({ ...next, id: initialEvent.id });
    } else {
      onAdd(next);
    }
    setDraft(initialDraft);
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-[#6f50761c] px-4"
          onClick={onClose}
        >
          <motion.form
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="glass-card pastel-border w-full max-w-md space-y-4 p-6"
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="cute-title text-xl font-bold">{initialEvent ? "Edit Story Event" : "Add Story Event"}</h3>

            <label className="grid gap-1 text-sm">
              <span className="cute-subtext font-semibold">Event Name</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Freelance bonus, Rent spike..."
                className="cute-input"
                required
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="cute-subtext font-semibold">Amount (positive or negative)</span>
              <input
                type="number"
                value={draft.amount}
                onChange={(e) => setDraft((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="12000 or -12000"
                className="cute-input"
                required
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="cute-subtext font-semibold">Month</span>
              <select
                value={draft.month}
                onChange={(e) => setDraft((prev) => ({ ...prev, month: Number(e.target.value) }))}
                className="cute-input"
              >
                {Array.from({ length: 12 }).map((_, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    Month {idx + 1}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-3 pt-1">
              <CuteButton type="submit" className="flex-1">Add Event</CuteButton>
              <button type="button" onClick={onClose} className="pastel-chip flex-1">
                Cancel
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
