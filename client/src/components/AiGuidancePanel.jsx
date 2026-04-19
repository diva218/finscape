import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiXMark, HiChatBubbleLeftRight } from "react-icons/hi2";

const guidanceTopics = {
  income: {
    title: "Monthly Income",
    tips: [
      "Enter your total monthly earnings after tax",
      "Include salary, freelance income, or passive income sources",
      "Use conservative estimates if income varies"
    ],
    example: "E.g., ₹90,000 for a typical IT professional"
  },
  expenses: {
    title: "Fixed Expenses",
    tips: [
      "Include rent, utilities, groceries, insurance",
      "Fixed expenses are regular monthly costs that don't change much",
      "Exclude one-time purchases and variable spending"
    ],
    example: "E.g., ₹38,000 for rent (₹25k) + utilities (₹5k) + groceries (₹8k)"
  },
  emi: {
    title: "Loans & EMI",
    tips: [
      "Enter your total monthly loan payments (car, home, personal loans)",
      "Keep EMI below 35-40% of your monthly income",
      "Include all active loan commitments"
    ],
    example: "E.g., ₹12,000 if you have a car loan with ₹10k EMI + personal loan ₹2k"
  },
  investments: {
    title: "Investments",
    tips: [
      "Include SIP contributions, stock investments, mutual funds",
      "Aim for at least 10-15% of monthly income",
      "This builds your long-term financial safety"
    ],
    example: "E.g., ₹8,000 for SIP (₹5k) + PPF (₹3k)"
  },
  discretionary: {
    title: "Lifestyle & Other Spend",
    tips: [
      "Entertainment, dining, shopping, subscriptions",
      "This is flexible spending you can adjust during emergencies",
      "Reduce this to improve your financial cushion"
    ],
    example: "E.g., ₹6,000 for movies (₹2k) + dining (₹3k) + subscriptions (₹1k)"
  },
  balance: {
    title: "Starting Balance",
    tips: [
      "Your current savings or emergency fund amount",
      "This is your financial cushion for unexpected events",
      "Aim to keep 3-6 months of expenses as emergency fund"
    ],
    example: "E.g., ₹120,000 as your current liquid savings"
  }
};

export default function AiGuidancePanel({ field, onClose }) {
  const [selectedTip, setSelectedTip] = useState(0);
  const topic = guidanceTopics[field];

  if (!topic) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed bottom-4 right-4 z-40 w-96 max-w-sm"
      >
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 p-4 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <HiChatBubbleLeftRight className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-900">Quick Guide</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white rounded-lg transition-colors"
            >
              <HiXMark className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <p className="text-sm font-semibold text-indigo-900 mb-2">{topic.title}</p>
          
          <div className="space-y-2 mb-3">
            {topic.tips.map((tip, idx) => (
              <label key={idx} className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={selectedTip === idx}
                  onChange={() => setSelectedTip(idx)}
                  className="mt-1"
                />
                <span className="text-slate-700">{tip}</span>
              </label>
            ))}
          </div>

          <div className="bg-white rounded-xl p-3 border border-indigo-100">
            <p className="text-xs font-semibold text-slate-600 mb-1">Example:</p>
            <p className="text-sm text-slate-700">{topic.example}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
