import axios from "axios";

/**
 * The WeatherAI API requires lat/lon, but users naturally type a place
 * name (e.g. "Bomet" or "Eldoret"). We resolve the name to coordinates
 * using Open-Meteo's free, keyless geocoding API.
 *
 * Docs: https://open-meteo.com/en/docs/geocoding-api
 */
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
}

interface OpenMeteoResult {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

interface OpenMeteoResponse {
  results?: OpenMeteoResult[];
}

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

/**
 * Resolve a place name to { lat, lon, displayName }.
 * Throws an ApiError with a descriptive message if no match is found
 * or the request fails.
 */
export async function geocodeLocation(name: string): Promise<GeocodeResult> {
  if (!name || !name.trim()) {
    throw new ApiError("Location name is required", 400);
  }

  try {
    const query = name.split(",")[0].trim();
    const res = await axios.get<OpenMeteoResponse>(GEOCODE_URL, {
      params: { name: query, count: 1, language: "en", format: "json" },
      timeout: 5000,
    });

    const results = res.data?.results;
    if (!results || results.length === 0) {
      throw new ApiError(`No location found matching "${name}"`, 404);
    }

    const top = results[0];
    return {
      lat: top.latitude,
      lon: top.longitude,
      displayName: [top.name, top.admin1, top.country].filter(Boolean).join(", "),
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;

    const message = err instanceof Error ? err.message : "Unknown error";
    throw new ApiError(`Geocoding service unavailable: ${message}`, 503);
  }
}
