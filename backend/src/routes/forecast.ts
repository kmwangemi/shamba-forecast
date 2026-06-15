import { Router, type Request, type Response, type NextFunction } from "express";
import { geocodeLocation, ApiError } from "../services/geocodingService";
import { getWeather } from "../services/weatherAiClient";
import { logForecastRequest } from "../services/forecastLogService";
import { TTLCache } from "../utils/ttlCache";

export interface ForecastPayload {
  location: { name: string | null; lat: number; lon: number };
  weather: Record<string, unknown>;
  meta: {
    cache: "hit" | "miss";
    rateLimit?: Record<string, string | undefined>;
    fetchedAt?: string;
  };
}

export function createForecastRouter(cache: TTLCache<ForecastPayload>): Router {
  const router = Router();

  /**
   * GET /api/forecast?town=Bomet
   * GET /api/forecast?lat=-1.29&lon=36.82
   *
   * Optional: &days=7 &units=metric &lang=en &ai=true
   *
   * Resolves a town name to coordinates (if provided), checks the
   * in-memory cache, and otherwise calls the WeatherAI API. Each
   * request is also logged to Firestore (if configured) for analytics.
   */
  router.get("/forecast", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        town,
        lat: latParam,
        lon: lonParam,
        days = "7",
        units = "metric",
        lang = "en",
        ai = "true",
      } = req.query as Record<string, string | undefined>;

      let lat = latParam ? Number(latParam) : null;
      let lon = lonParam ? Number(lonParam) : null;
      let displayName: string | null = town || null;

      if (!town && (lat === null || lon === null)) {
        throw new ApiError("Provide either ?town=<name> or ?lat=&lon=", 400);
      }

      // Resolve town name to coordinates if lat/lon weren't given directly.
      if (town && (lat === null || lon === null)) {
        const geo = await geocodeLocation(town);
        lat = geo.lat;
        lon = geo.lon;
        displayName = geo.displayName;
      }

      const aiBool = ai !== "false";
      const cacheKey = cache.buildKey(lat as number, lon as number, {
        days,
        units,
        lang,
        ai: aiBool,
      });

      const cached = cache.get(cacheKey);
      if (cached) {
        await logForecastRequest({
          town: displayName,
          lat: lat as number,
          lon: lon as number,
          cacheStatus: "hit",
          requestedAt: new Date(),
        });

        res.json({
          ...cached,
          location: { ...cached.location, name: displayName || cached.location.name },
          meta: { ...cached.meta, cache: "hit" },
        });
        return;
      }

      const { data, rateLimit } = await getWeather({
        lat: lat as number,
        lon: lon as number,
        days: Number(days),
        ai: aiBool,
        units,
        lang,
      });

      const payload: ForecastPayload = {
        location: { name: displayName, lat: lat as number, lon: lon as number },
        weather: data,
        meta: {
          cache: "miss",
          rateLimit,
          fetchedAt: new Date().toISOString(),
        },
      };

      cache.set(cacheKey, payload);

      await logForecastRequest({
        town: displayName,
        lat: lat as number,
        lon: lon as number,
        cacheStatus: "miss",
        requestedAt: new Date(),
      });

      res.json(payload);
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/cache-stats
   * Small debug endpoint showing cache size/TTL - useful to demonstrate
   * the caching strategy is working during review.
   */
  router.get("/cache-stats", (_req: Request, res: Response) => {
    res.json(cache.stats());
  });

  return router;
}
