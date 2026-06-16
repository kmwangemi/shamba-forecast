import axios, { type AxiosInstance } from "axios";
import { ApiError } from "./geocodingService";

const BASE_URL = process.env.WEATHERAI_BASE_URL || "https://api.weather-ai.co";
const API_KEY = process.env.WEATHERAI_API_KEY;

if (!API_KEY) {
  // Fail loudly at startup rather than returning cryptic 401s later.
  console.warn(
    "[weatherAiClient] WARNING: WEATHERAI_API_KEY is not set. " +
      "Requests to the WeatherAI API will fail with 401."
  );
}

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});

export interface RateLimitInfo {
  limit?: string;
  remaining?: string;
  reset?: string;
  [key: string]: string | undefined;
}

export interface GetWeatherParams {
  lat: number;
  lon: number;
  days?: number;
  ai?: boolean;
  units?: string;
  lang?: string;
}

export interface GetWeatherResult {
  data: Record<string, unknown>;
  rateLimit: RateLimitInfo;
}

export interface GetWeatherGeoParams {
  ip: string;
  days?: number;
  ai?: boolean;
  units?: string;
  lang?: string;
}

export interface GetWeatherGeoResult {
  data: Record<string, unknown>;
  geo: Record<string, string>; // From response headers X-Country, X-Region, etc.
  rateLimit: RateLimitInfo;
}

/** Sleep helper for backoff. */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function extractRateLimit(headers: Record<string, unknown>): RateLimitInfo {
  return {
    limit: headers["x-ratelimit-limit"] as string | undefined,
    remaining: headers["x-ratelimit-remaining"] as string | undefined,
    reset: headers["x-ratelimit-reset"] as string | undefined,
  };
}

/**
 * Fetch weather + AI summary for a coordinate pair.
 *
 * Retries on 500/503 with exponential backoff (per the API's documented
 * error codes: 500 = retry with backoff, 503 = service unavailable).
 * Does NOT retry on 401/403/429/400 - those are permanent for the current
 * request and should be surfaced to the caller immediately.
 */
export async function getWeather(
  { lat, lon, days = 7, ai = true, units = "metric", lang = "en" }: GetWeatherParams,
  maxRetries = 2
): Promise<GetWeatherResult> {
  let attempt = 0;

  while (true) {
    try {
      const res = await client.get("/v1/weather", {
        params: { lat, lon, days, ai, units, lang },
      });

      return {
        data: res.data,
        rateLimit: extractRateLimit(res.headers as Record<string, unknown>),
      };
    } catch (err) {
      if (!axios.isAxiosError(err)) {
        throw new ApiError(`Unexpected error: ${(err as Error).message}`, 500);
      }

      const status = err.response?.status;

      // Permanent failures - surface immediately, no retry.
      if (status === 401 || status === 403 || status === 429 || status === 400) {
        const message =
          (err.response?.data as { message?: string; error?: string })?.message ||
          (err.response?.data as { message?: string; error?: string })?.error ||
          `WeatherAI API error (${status})`;

        const apiError = new ApiError(message, status);
        (apiError as ApiError & { rateLimit?: RateLimitInfo }).rateLimit = extractRateLimit(
          (err.response?.headers as Record<string, unknown>) || {}
        );
        throw apiError;
      }

      // Transient failures (500/503/network) - retry with backoff.
      const isTransient = status === 500 || status === 503 || !err.response;

      if (isTransient && attempt < maxRetries) {
        const backoffMs = 500 * 2 ** attempt; // 500ms, 1000ms, 2000ms...
        console.warn(
          `[weatherAiClient] Transient error (status=${status || "network"}), ` +
            `retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`
        );
        await sleep(backoffMs);
        attempt += 1;
        continue;
      }

      // Out of retries or unknown error - surface a 502/503.
      throw new ApiError(
        `WeatherAI API unavailable after ${attempt + 1} attempt(s): ${err.message}`,
        status === 503 ? 503 : 502
      );
    }
  }
}

/**
 * Fetch weather using IP geo-detection.
 */
export async function getWeatherGeo(
  { ip, days = 7, ai = false, units = "metric", lang = "en" }: GetWeatherGeoParams,
  maxRetries = 2
): Promise<GetWeatherGeoResult> {
  let attempt = 0;

  while (true) {
    try {
      const res = await client.get("/v1/weather-geo", {
        params: { ip, days, ai, units, lang },
      });

      const headers = res.headers as Record<string, unknown>;
      return {
        data: res.data,
        geo: {
          country: headers["x-country"] as string || "",
          region: headers["x-region"] as string || "",
          city: headers["x-city"] as string || "",
        },
        rateLimit: extractRateLimit(headers),
      };
    } catch (err) {
      if (!axios.isAxiosError(err)) {
        throw new ApiError(`Unexpected error: ${(err as Error).message}`, 500);
      }

      const status = err.response?.status;
      if (status === 401 || status === 403 || status === 429 || status === 400) {
        const message =
          (err.response?.data as { message?: string; error?: string })?.message ||
          (err.response?.data as { message?: string; error?: string })?.error ||
          `WeatherAI API error (${status})`;

        const apiError = new ApiError(message, status);
        (apiError as ApiError & { rateLimit?: RateLimitInfo }).rateLimit = extractRateLimit(
          (err.response?.headers as Record<string, unknown>) || {}
        );
        throw apiError;
      }

      const isTransient = status === 500 || status === 503 || !err.response;
      if (isTransient && attempt < maxRetries) {
        const backoffMs = 500 * 2 ** attempt;
        await sleep(backoffMs);
        attempt += 1;
        continue;
      }

      throw new ApiError(
        `WeatherAI API unavailable after ${attempt + 1} attempt(s): ${err.message}`,
        status === 503 ? 503 : 502
      );
    }
  }
}
