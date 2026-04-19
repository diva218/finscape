import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CuteButton from "../components/CuteButton";
import GradientText from "../components/GradientText";

export default function NotFoundPage() {
  return (
    <div className="cute-shell grid min-h-screen place-items-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="glass-card pastel-border p-8"
      >
        <GradientText className="font-[Poppins] text-5xl font-extrabold">404</GradientText>
        <p className="cute-subtext mt-2">This page does not exist.</p>
        <Link to="/" className="mt-4 inline-block">
          <CuteButton>Go Home</CuteButton>
        </Link>
      </motion.div>
    </div>
  );
}
