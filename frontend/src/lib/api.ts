import type { ApiErrorResponse, ForecastResponse, SummaryLanguage } from "../types/weather";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface FetchForecastOptions {
  lang?: SummaryLanguage;
  units?: "metric" | "imperial";
  ai?: boolean;
}

/**
 * Fetch the forecast for a given town name from our backend.
 * Throws an Error with a user-friendly message on failure.
 */
export async function fetchForecast(
  town: string,
  options: FetchForecastOptions = {}
): Promise<ForecastResponse> {
  const { lang = "en", units = "metric", ai } = options;
  const url = new URL("/api/forecast", API_BASE_URL);
  url.searchParams.set("town", town);
  url.searchParams.set("lang", lang);
  url.searchParams.set("units", units);
  if (ai !== undefined) {
    url.searchParams.set("ai", String(ai));
  }

  const res = await fetch(url.toString());
  const body = (await res.json().catch(() => ({}))) as
    | ForecastResponse
    | ApiErrorResponse;

  if (!res.ok) {
    const errBody = body as ApiErrorResponse;
    throw new Error(errBody.error || `Request failed with status ${res.status}`);
  }

  return body as ForecastResponse;
}

/**
 * Fetch the forecast for the user's auto-detected location based on IP.
 */
export async function fetchAutoLocation(
  { lang = "en", units = "metric", ai = false }: FetchForecastOptions = {}
): Promise<ForecastResponse> {
  const url = new URL("/api/forecast/auto", API_BASE_URL);
  url.searchParams.set("lang", lang);
  url.searchParams.set("units", units);
  url.searchParams.set("ai", String(ai));

  const res = await fetch(url.toString());
  const body = (await res.json().catch(() => ({}))) as
    | ForecastResponse
    | ApiErrorResponse;

  if (!res.ok) {
    const errBody = body as ApiErrorResponse;
    throw new Error(errBody.error || `Request failed with status ${res.status}`);
  }

  return body as ForecastResponse;
}
