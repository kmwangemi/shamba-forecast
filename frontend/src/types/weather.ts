/**
 * Shared types describing the shape of data returned by our backend's
 * /api/forecast endpoint.
 *
 * NOTE: The WeatherAI docs don't publish a full example response body
 * for /v1/weather, so `weather` is typed loosely (Record<string, unknown>)
 * with optional known fields. Once you've made a real request, tighten
 * this up with the actual field names you see.
 */

export interface Location {
  name: string | null;
  lat: number;
  lon: number;
}

export interface RateLimitInfo {
  limit?: string;
  remaining?: string;
  reset?: string;
}

export interface ForecastMeta {
  cache: "hit" | "miss";
  rateLimit?: RateLimitInfo;
  fetchedAt?: string;
}

export interface CurrentConditions {
  temperature?: number;
  temp?: number;
  temp_c?: number;
  feels_like?: number;
  feelslike_c?: number;
  humidity?: number;
  wind_speed?: number;
  wind_kph?: number;
  windspeed?: number;
  condition?: string | { text: string };
  weather_description?: string;
}

export interface DailyForecastDay {
  date?: string;
  day?: string | { maxtemp_c?: number; mintemp_c?: number; condition?: { text: string } };
  temp_max?: number;
  temp_min?: number;
  maxtemp_c?: number;
  mintemp_c?: number;
  condition?: string | { text: string };
  weather_description?: string;
  chance_of_rain?: number;
  daily_chance_of_rain?: number;
  precipitation_probability?: number;
}

export interface WeatherResponse {
  current?: CurrentConditions;
  current_weather?: CurrentConditions;
  daily?: DailyForecastDay[];
  forecast?: DailyForecastDay[] | { forecastday: DailyForecastDay[] };
  ai_summary?: string;
  summary?: string;
  insights?: { summary?: string };
  [key: string]: unknown;
}

export interface ForecastResponse {
  location: Location;
  weather: WeatherResponse;
  meta: ForecastMeta;
}

export interface ApiErrorResponse {
  error: string;
  rateLimit?: RateLimitInfo;
}

export type SummaryLanguage = "en" | "sw";
export type StatusBannerType = "error" | "loading" | "info" | "empty";
