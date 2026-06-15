import "dotenv/config";
import express from "express";
import cors from "cors";

import { TTLCache } from "./utils/ttlCache";
import { createForecastRouter, type ForecastPayload } from "./routes/forecast";
import { errorHandler } from "./middleware/errorHandler";
import { isFirebaseConfigured } from "./config/firebase";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CACHE_TTL = Number(process.env.CACHE_TTL_SECONDS) || 900;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Shared cache instance for forecast responses.
const forecastCache = new TTLCache<ForecastPayload>(CACHE_TTL);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    uptimeSeconds: process.uptime(),
    cache: forecastCache.stats(),
    firebase: isFirebaseConfigured ? "connected" : "not configured",
  });
});

app.use("/api", createForecastRouter(forecastCache));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`WeatherAI dashboard API listening on port ${PORT}`);
  console.log(`Cache TTL: ${CACHE_TTL}s`);
  console.log(`Firebase: ${isFirebaseConfigured ? "connected" : "not configured"}`);
});
