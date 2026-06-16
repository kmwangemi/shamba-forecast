import type { ForecastResponse, SummaryLanguage } from "../types/weather";

interface FetchForecastOptions {
  lang?: SummaryLanguage;
  units?: "metric" | "imperial";
  ai?: boolean;
  days?: number;
  lat?: number;
  lon?: number;
}

const getMockData = (town: string, lang: string, days: number, lat?: number, lon?: number): ForecastResponse => {
  const isSw = lang === 'sw';
  const displayTown = town === "Auto Location" ? "Nairobi, Kenya" : town;

  let finalLat = lat || -1.2921;
  let finalLon = lon || 36.8219;
  
  if (!lat && town) {
     const t = town.toLowerCase();
     if (t.includes("mombasa")) { finalLat = -4.0435; finalLon = 39.6682; }
     else if (t.includes("kisumu")) { finalLat = -0.1022; finalLon = 34.7617; }
     else if (t.includes("eldoret")) { finalLat = 0.5143; finalLon = 35.2698; }
     else if (t.includes("bomet")) { finalLat = -0.7813; finalLon = 35.3416; }
     // Generate a deterministic fake coordinate for any other unknown old history
     else if (town !== "Auto Location") {
       let hash = 0;
       for (let i = 0; i < town.length; i++) { hash = town.charCodeAt(i) + ((hash << 5) - hash); }
       finalLat = -1.0 + (hash % 1000) / 1000.0;
       finalLon = 36.0 + ((hash >> 2) % 1000) / 1000.0;
     }
  }
  
  const forecastday = Array.from({ length: days }, (_, i) => {
    const conditions = isSw ? ["Jua", "Mawingu Kiasi", "Mvua Nyepesi"] : ["Sunny", "Partly Cloudy", "Light Rain"];
    return {
      date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
      temp_max: 25 + Math.floor(Math.random() * 5),
      temp_min: 14 + Math.floor(Math.random() * 4),
      chance_of_rain: Math.floor(Math.random() * 50),
      condition: { text: conditions[i % 3] }
    };
  });

  return {
    location: {
      name: displayTown,
      lat: finalLat,
      lon: finalLon
    },
    weather: {
      current: {
        temperature: 24,
        feels_like: 25,
        humidity: 62,
        wind_speed: 12,
        condition: { text: isSw ? "Mawingu Kiasi" : "Partly Cloudy" }
      },
      forecast: {
        forecastday
      },
      ai_summary: isSw 
        ? "Hali ya hewa itakuwa na mawingu kiasi na joto zuri. Hali nzuri kwa shughuli za kilimo za nje, ingawa mvua nyepesi inawezekana baadaye wiki hii. Hakikisha kufuatilia viwango vya unyevu wa udongo."
        : "The weather will be mostly partly cloudy with pleasant temperatures. Perfect conditions for outdoor farming activities, though light rain is possible later in the week. Make sure to monitor soil moisture levels."
    },
    meta: {
      cache: "miss",
      fetchedAt: new Date().toISOString()
    }
  };
};

export async function fetchForecast(
  town: string,
  options: FetchForecastOptions = {}
): Promise<ForecastResponse> {
  const { lang = "en", days = 7, lat, lon } = options;
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getMockData(town, lang, days, lat, lon));
    }, 800);
  });
}

export async function fetchAutoLocation(
  options: FetchForecastOptions = {}
): Promise<ForecastResponse> {
  const { lang = "en", days = 7 } = options;
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getMockData("Auto Location", lang, days));
    }, 800);
  });
}

/* --- REAL IMPLEMENTATION SAVED FOR REVERT ---
// import type { ApiErrorResponse } from "../types/weather";
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function fetchForecast(
  town: string,
  options: FetchForecastOptions = {}
): Promise<ForecastResponse> {
  const { lang = "en", units = "metric", ai, days = 7, lat, lon } = options;
  const url = new URL("/api/forecast", import.meta.env.VITE_API_BASE_URL || "http://localhost:5000");
  url.searchParams.set("town", town);
  url.searchParams.set("lang", lang);
  url.searchParams.set("units", units);
  url.searchParams.set("days", String(days));
  if (ai !== undefined) {
    url.searchParams.set("ai", String(ai));
  }
  if (lat !== undefined) {
    url.searchParams.set("lat", String(lat));
  }
  if (lon !== undefined) {
    url.searchParams.set("lon", String(lon));
  }

  const res = await fetch(url.toString());
  const body = (await res.json().catch(() => ({}))) as
    | ForecastResponse
    | ApiErrorResponse;

  if (!res.ok) {
    const errBody = body as ApiErrorResponse;
    throw new Error(errBody.error || \`Request failed with status \${res.status}\`);
  }

  return body as ForecastResponse;
}

export async function fetchAutoLocation(
  { lang = "en", units = "metric", ai = false, days = 7 }: FetchForecastOptions = {}
): Promise<ForecastResponse> {
  const url = new URL("/api/forecast/auto", import.meta.env.VITE_API_BASE_URL || "http://localhost:5000");
  url.searchParams.set("lang", lang);
  url.searchParams.set("units", units);
  url.searchParams.set("days", String(days));
  url.searchParams.set("ai", String(ai));

  const res = await fetch(url.toString());
  const body = (await res.json().catch(() => ({}))) as
    | ForecastResponse
    | ApiErrorResponse;

  if (!res.ok) {
    const errBody = body as ApiErrorResponse;
    throw new Error(errBody.error || \`Request failed with status \${res.status}\`);
  }

  return body as ForecastResponse;
}
*/
