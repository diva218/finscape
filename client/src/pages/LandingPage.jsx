import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight, FaHeart, FaMagic, FaStar } from "react-icons/fa";

const highlights = [
  "Build month-based money stories",
  "Place events as interactive blocks",
  "Simulate outcomes with animated graphs"
];

const stats = [
  ["12-Month", "projection horizon"],
  ["0-10", "stress score scale"],
  ["3+", "scenarios to compare"],
  ["Live", "backend-driven updates"]
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8fc] via-[#faf9f6] to-[#f2f6ff] px-4 py-4 text-slate-900 md:px-6 md:py-6">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border-2 border-[#e9d0f3] bg-white/90 p-4 shadow-[0_18px_50px_-18px_rgba(124,58,237,0.35)] backdrop-blur-sm md:p-6"
      >
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#f9a8d4]/35 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-14 -right-10 h-48 w-48 rounded-full bg-[#bfdbfe]/45 blur-2xl" />

        <div className="relative mb-8 border-b-2 border-[#f0dff8] pb-4 text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-700">Financial Storytelling Simulator</p>
          <h1 className="mt-2 text-2xl font-black md:text-3xl">FinScape</h1>
        </div>

        <div className="relative grid gap-10 text-center">
          <div className="mx-auto w-full max-w-4xl">
            <h2 className="mt-5 text-5xl font-black leading-[0.93] md:text-7xl">
              Simulate the move,
              <span className="block text-[#7C3AED]">then make the call</span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-relaxed text-slate-700 md:text-xl">
              Build scenarios as visual events, place them on a timeline, compare multiple futures, and watch your story shape the outcome with live simulation and AI guidance.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/signup" className="inline-flex">
                <button className="inline-flex items-center gap-3 rounded-full border-2 border-[#d7b3ec] bg-[#7C3AED] px-6 py-4 font-black text-white shadow-[0_14px_28px_-14px_rgba(124,58,237,0.85)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#8b5cf6]">
                  <FaMagic /> Get Started
                  <FaArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </Link>
              <Link to="/login" className="inline-flex">
                <button className="inline-flex items-center gap-3 rounded-full border-2 border-[#d8c8ea] bg-[#FAF9F6] px-6 py-4 font-black text-slate-900 shadow-[0_14px_28px_-16px_rgba(59,130,246,0.6)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#F9A8D4]/55">
                  <FaHeart /> Login
                </button>
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {highlights.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.08 }}
                  className="rounded-2xl border-2 border-[#ead7f6] bg-[#fff8fe] px-4 py-4 shadow-[0_14px_26px_-18px_rgba(59,130,246,0.7)] transition-transform duration-200 hover:-translate-y-1 hover:bg-white"
                >
                  <div className="flex items-center gap-3 text-sm font-black text-slate-950">
                    <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#e6c7f2] bg-[#F9A8D4]/70 text-slate-950 shadow-[0_8px_18px_-10px_rgba(236,72,153,0.8)]">
                      <FaStar />
                    </span>
                    {item}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-lg">
            <div className="relative mx-auto max-w-md rounded-[2rem] border-2 border-[#e5cff5] bg-[#fff8fe] p-5 shadow-[0_18px_42px_-18px_rgba(124,58,237,0.45)]">
              <div className="rounded-2xl border-2 border-[#dfc5f2] bg-white p-4 shadow-[0_14px_24px_-18px_rgba(124,58,237,0.6)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7C3AED]">Scenario Snapshot</p>
                <h3 className="mt-2 text-2xl font-black text-slate-900">Home Loan + Career Shift</h3>
                <p className="mt-2 text-sm font-medium text-slate-700">Quickly compare how major life choices impact monthly balance, stress score, and downside risk before you commit.</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-[#edd7f8] bg-[#fdf5ff] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-600">Projected End Balance</p>
                  <p className="mt-2 text-2xl font-black text-[#7C3AED]">+ 2.4L</p>
                </div>
                <div className="rounded-2xl border-2 border-[#d8e8ff] bg-[#f3f8ff] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-600">Risk Trend</p>
                  <p className="mt-2 text-2xl font-black text-[#2563eb]">Moderate</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border-2 border-[#e8d2f5] bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-600">Top Recommendation</p>
                <p className="mt-1 text-sm font-medium text-slate-700">Reduce discretionary spend by 8-10% in months 2-4 to improve cushion during high-outflow events.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {stats.map(([value, label], index) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + index * 0.08 }}
              className="rounded-2xl border-2 border-[#e8d2f5] bg-[#fff8fe] p-5 text-center shadow-[0_16px_30px_-18px_rgba(236,72,153,0.75)] transition-transform duration-200 hover:-translate-y-1 hover:bg-white"
            >
              <p className="text-2xl font-black text-slate-950">{value}</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
