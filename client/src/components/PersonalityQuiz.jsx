import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { submitPersonalityQuiz } from "../api/client";

const quizSteps = [
  {
    id: "spending",
    title: "How do you typically spend money?",
    options: [
      { value: "frugal", label: "Very careful with every dollar (Frugal)" },
      { value: "moderate", label: "Balanced spending & saving (Moderate)" },
      { value: "spender", label: "I enjoy spending on experiences (Spender)" }
    ]
  },
  {
    id: "risk",
    title: "What's your risk tolerance?",
    options: [
      { value: "low", label: "I prefer stability & predictability (Low Risk)" },
      { value: "medium", label: "I'm comfortable with some uncertainty (Medium)" },
      { value: "high", label: "I'm willing to take calculated risks (High Risk)" }
    ]
  },
  {
    id: "savings",
    title: "How often do you save?",
    options: [
      { value: "always_saves", label: "I save regularly every month" },
      { value: "sometimes_saves", label: "I save when I can" },
      { value: "rarely_saves", label: "Saving is difficult for me" }
    ]
  }
];

export default function PersonalityQuiz({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ spending: null, risk: null, savings: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, token, refreshProfile } = useAuth();

  const currentQuiz = quizSteps[step];
  const isLastStep = step === quizSteps.length - 1;
  const isAnswered = answers[currentQuiz.id] !== null;

  async function handleNext() {
    if (!isLastStep) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await submitPersonalityQuiz(
        {
          userId: user?._id,
          spendingHabits: answers.spending,
          riskTolerance: answers.risk,
          savingsBehavior: answers.savings
        },
        token
      );

      if (data.success) {
        await refreshProfile();
        onComplete(data.personality);
      } else {
        setError("Quiz submission did not complete. Please try again.");
      }
    } catch (error) {
      console.error("Quiz submission failed:", error);
      setError(error.message || "Could not save your quiz answers.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectAnswer(value) {
    setAnswers((prev) => ({ ...prev, [currentQuiz.id]: value }));
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="w-full max-w-2xl"
      >
        <div className="mb-8">
          <div className="flex gap-2 mb-2">
            {quizSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition ${index <= step ? "bg-indigo-600" : "bg-slate-200"}`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-600">Question {step + 1} of {quizSteps.length}</p>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-8">{currentQuiz.title}</h2>

          <div className="space-y-3 mb-8">
            {currentQuiz.options.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => handleSelectAnswer(option.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-2xl border-2 transition text-left font-semibold ${
                  answers[currentQuiz.id] === option.value
                    ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition ${
                      answers[currentQuiz.id] === option.value ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                    }`}
                  />
                  <span>{option.label}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-between">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="px-6 py-2 rounded-full border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!isAnswered || loading}
              className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 transition font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
            >
              {loading ? "Saving..." : isLastStep ? "Complete Quiz" : "Next"}
            </button>
          </div>
          {error ? <p className="mt-4 text-sm text-[#bf668a]">{error}</p> : null}
        </motion.div>
      </motion.div>
    </div>
  );
}
