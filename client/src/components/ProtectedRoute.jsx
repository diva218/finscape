import { Navigate, Outlet } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import GradientText from "./GradientText";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="cute-shell grid min-h-screen place-items-center"
      >
        <div className="glass-card pastel-border flex flex-col items-center gap-3 px-8 py-7">
          <CircularProgress sx={{ color: "#cdb4db" }} />
          <GradientText className="font-[Poppins] text-lg font-bold">Loading your cute dashboard...</GradientText>
        </div>
      </motion.div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
