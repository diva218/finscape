import { motion } from "framer-motion";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/playground", label: "Playground" },
  { to: "/simulation", label: "Simulation" },
  { to: "/insights", label: "Insights" },
  { to: "/ai", label: "AI" },
  { to: "/profile", label: "Profile" }
];

export default function AppFrame({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-950">
      <motion.header
        initial={{ opacity: 0, y: 40 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="sticky top-0 z-40 w-full border-b-[3px] border-[#3b2f54] bg-[#FAF9F6]/95 backdrop-blur-sm"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
          <Link to="/playground" className="text-2xl font-black tracking-tight">
            <span>FinScape</span>
          </Link>
          <nav className="flex flex-wrap gap-3">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                    `rounded-full border-[3px] border-[#3b2f54] px-4 py-2 text-sm font-black uppercase tracking-[0.12em] transition-all duration-200 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(124,58,237,0.18)] ${isActive ? "bg-[#F9A8D4] text-slate-950" : "bg-white text-slate-950 hover:bg-[#DBEAFE] hover:text-slate-950"}`
                }
              >
                <motion.span whileHover={{ y: -1 }} transition={{ type: "spring", stiffness: 220, damping: 15 }}>
                  {item.label}
                </motion.span>
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="rounded-full border-[3px] border-[#3b2f54] bg-white px-4 py-2 text-sm font-black shadow-[5px_5px_0px_0px_rgba(249,168,212,0.35)]">{user?.fullName || "User"}</span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="rounded-full border-[3px] border-[#3b2f54] bg-[#F9A8D4] px-4 py-2 font-black text-slate-950 shadow-[5px_5px_0px_0px_rgba(249,168,212,0.35)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#7C3AED] hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </motion.header>
      <motion.main
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="mx-auto w-full max-w-7xl px-4 py-8 pb-12 md:px-6"
      >
        {children}
      </motion.main>
    </div>
  );
}
