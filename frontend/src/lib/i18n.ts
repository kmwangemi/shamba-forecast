import type { SummaryLanguage } from "../types/weather";

export const translations = {
  en: {
    title: "Shamba Forecast",
    subtitle: "Hyperlocal weather and farm guidance, powered by WeatherAI",
    aiAdvice: "Farm Insights",
    on: "On",
    off: "Off",
    language: "Language",
    forecastDays: "Forecast Days",
    day1: "1 Day",
    day3: "3 Days",
    day7: "7 Days (Max Free)",
    footer: "Data from the WeatherAI API. Built as a demo integration showing caching, geocoding, Firestore-backed history, and resilient error handling.",
    searchPlaceholder: "Enter a town, e.g. Bomet",
    getForecast: "Get forecast",
    searching: "Searching…",
    currentWeatherIn: "Current weather in",
    feelsLike: "Feels like",
    humidity: "Humidity",
    wind: "Wind",
    outlook: "outlook",
    aiSummary: "Farm insights",
    recentSearches: "Recent searches",
    clear: "Clear",
    fetching: "Fetching forecast…",
    cacheHit: "Served from cache - this location was fetched recently.",
    emptySearch: "Search for a town or pick one above to see the forecast.",
    errorGeneric: "Something went wrong",
    autoLocation: "Auto Location",
    tempTrend: "Forecast Trend",
    maxTemp: "Max Temp",
    minTemp: "Min Temp",
    rainChance: "Chance of Rain"
  },
  sw: {
    title: "Utabiri wa Shamba",
    subtitle: "Utabiri wa hali ya hewa na ushauri wa kilimo, kupitia WeatherAI",
    aiAdvice: "Ushauri wa Kilimo",
    on: "Washa",
    off: "Zima",
    language: "Lugha",
    forecastDays: "Siku za Utabiri",
    day1: "Siku 1",
    day3: "Siku 3",
    day7: "Siku 7 (Upeo wa Bure)",
    footer: "Data kutoka WeatherAI API. Imeundwa kama onyesho linaloonyesha akiba, utafutaji wa maeneo, na ushughulikiaji wa makosa.",
    searchPlaceholder: "Ingiza mji, k.m. Bomet",
    getForecast: "Pata utabiri",
    searching: "Inatafuta…",
    currentWeatherIn: "Hali ya hewa ya sasa",
    feelsLike: "Inahisi kama",
    humidity: "Unyevu",
    wind: "Upepo",
    outlook: "Mtazamo wa siku",
    aiSummary: "Ushauri wa Kilimo",
    recentSearches: "Tafiti za hivi karibuni",
    clear: "Futa",
    fetching: "Inaleta utabiri…",
    cacheHit: "Imeletwa kutoka kwenye akiba - eneo hili lilitafutwa hivi karibuni.",
    emptySearch: "Tafuta mji au chagua mmoja hapo juu kuona utabiri.",
    errorGeneric: "Kuna kitu kimeenda mrama",
    autoLocation: "Eneo la Kiotomatiki",
    tempTrend: "Mwenendo wa Utabiri",
    maxTemp: "Joto la Juu",
    minTemp: "Joto la Chini",
    rainChance: "Uwezekano wa Mvua"
  }
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, lang: SummaryLanguage): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}
