import { motion } from "framer-motion";
import clsx from "clsx";

export default function FloatingContainer({ className = "", delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: [0, -6, 0, 6, 0] }}
      transition={{
        opacity: { duration: 0.5, delay },
        y: { duration: 5.2, repeat: Infinity, ease: "easeInOut", delay },
        default: { type: "spring", stiffness: 120, damping: 12 }
      }}
      className={clsx(className)}
    >
      {children}
    </motion.div>
  );
}