const dotenv = require("dotenv");

function loadEnv() {
  dotenv.config();
}

function getEnv() {
  const rawOrigins = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  const clientOrigins = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const dnsServers = (process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGODB_URI || "",
    mongoUriFallback: process.env.MONGODB_URI_FALLBACK || "",
    dnsServers,
    clientOrigin: clientOrigins[0] || "http://localhost:5173",
    clientOrigins,
    jwtSecret: process.env.JWT_SECRET || "dev-secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    openaiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini"
  };
}

module.exports = { loadEnv, getEnv };
