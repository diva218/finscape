const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { loadEnv, getEnv } = require("./config/env");
const { connectDatabase } = require("./db/connect");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const scenarioRoutes = require("./routes/scenarioRoutes");
const simulationRoutes = require("./routes/simulationRoutes");
const personalityRoutes = require("./routes/personalityRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

loadEnv();
const env = getEnv();

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const isConfiguredOrigin = Array.isArray(env.clientOrigins) && env.clientOrigins.includes(origin);
      const isLocalhostDev = /^http:\/\/localhost:\d+$/.test(origin);

      if (isConfiguredOrigin || isLocalhostDev) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    service: "financial-decision-simulator-api",
    status: "ok",
    docs: {
      health: "/api/health",
      auth: "/api/auth",
      user: "/api/user",
      scenario: "/api/scenario",
      personality: "/api/personality",
      ai: "/api/ai/analyze"
    }
  });
});

app.get("/api", (_req, res) => {
  res.json({
    message: "API root",
    health: "/api/health"
  });
});

app.get("/api/health", (_req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({ status: "ok", service: "financial-decision-simulator-api", database: dbState });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/scenario", scenarioRoutes);
app.use("/api/personality", personalityRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", simulationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = env.port;

connectDatabase().finally(() => {
  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
});
