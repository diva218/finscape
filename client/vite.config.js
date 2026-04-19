import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("framer-motion")) return "motion";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("@mui") || id.includes("@emotion")) return "mui";
          if (id.includes("lenis")) return "lenis";
          if (id.includes("react-hot-toast")) return "toast";
          if (id.includes("react-icons")) return "icons";
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": process.env.VITE_API_PROXY_TARGET || "http://localhost:5001"
    }
  }
});
