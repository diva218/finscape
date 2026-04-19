import { motion } from "framer-motion";
import clsx from "clsx";

export default function CuteButton({ className = "", children, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      className={clsx("rounded-full bg-pink-200 hover:bg-pink-300 transition-all duration-300 font-semibold text-[#7c627f] px-6 py-3", className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}