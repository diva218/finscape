import { motion } from "framer-motion";
import clsx from "clsx";

export default function AnimatedCard({ className = "", delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        opacity: { duration: 0.22, delay, ease: "easeOut" }
      }}
      style={{ willChange: "opacity" }}
      className={clsx("glass-card card-hover-stable", className)}
    >
      {children}
    </motion.div>
  );
}
