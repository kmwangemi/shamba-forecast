import type { ApiErrorResponse, ForecastResponse, SummaryLanguage } from "../types/weather";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface FetchForecastOptions {
  lang?: SummaryLanguage;
  units?: "metric" | "imperial";
}

/**
 * Fetch the forecast for a given town name from our backend.
 * Throws an Error with a user-friendly message on failure.
 */
export async function fetchForecast(
  town: string,
  { lang = "en", units = "metric" }: FetchForecastOptions = {}
): Promise<ForecastResponse> {
  const url = new URL("/api/forecast", API_BASE_URL);
  url.searchParams.set("town", town);
  url.searchParams.set("lang", lang);
  url.searchParams.set("units", units);

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
