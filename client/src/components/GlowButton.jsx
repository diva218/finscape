import { motion } from "framer-motion";
import clsx from "clsx";

export default function GlowButton({ className = "", children, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={clsx("glow-button", className)}
      {...props}
    >
      <span>{children}</span>
    </motion.button>
  );
}
