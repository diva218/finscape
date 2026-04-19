const mongoose = require("mongoose");
const dns = require("dns");
const { getEnv } = require("../config/env");

async function tryConnect(uri, options, maxAttempts = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(uri, options);
      return true;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        console.warn(`MongoDB connect attempt ${attempt} failed, retrying...`);
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  return false;
}

async function connectDatabase() {
  const { mongoUri: uri, mongoUriFallback, dnsServers } = getEnv();
  const connectOptions = {
    serverSelectionTimeoutMS: 12000,
    family: 4
  };

  if (!uri) {
    console.warn("MONGODB_URI missing. Running without database connection.");
    return;
  }

  try {
    if (uri.startsWith("mongodb+srv://") && Array.isArray(dnsServers) && dnsServers.length) {
      dns.setServers(dnsServers);
    }

    await tryConnect(uri, connectOptions, 3);
    console.log("MongoDB connected");
  } catch (error) {
    const isSrvDnsError = String(error?.message || "").includes("querySrv");

    if (isSrvDnsError && mongoUriFallback) {
      try {
        await tryConnect(mongoUriFallback, connectOptions, 2);
        console.log("MongoDB connected via fallback URI");
        return;
      } catch (fallbackError) {
        console.warn("MongoDB fallback connection failed. Continuing without persistence.");
        console.warn(fallbackError.message);
        return;
      }
    }

    console.warn("MongoDB connection failed. Continuing without persistence.");
    console.warn(error.message);
    if (isSrvDnsError) {
      console.warn("Atlas SRV DNS lookup failed. Either whitelist your network/DNS or set MONGODB_URI_FALLBACK with a non-SRV mongodb:// URI.");
    }
  }
}

module.exports = { connectDatabase };
