# Frontend - Shamba Forecast

React + TypeScript + Vite + Tailwind CSS dashboard for the WeatherAI demo integration.

## Current Setup & Simulation Mode

> [!IMPORTANT]
> **The frontend is currently operating in "Simulation Mode".** 
> To allow for UI testing without consuming the WeatherAI API quota or requiring a live backend, the application currently uses mock data generated directly inside `src/lib/api.ts`.
> 
> **To revert to the live backend:**
> 1. Open `src/lib/api.ts`.
> 2. Delete the temporary `getMockData` function and the mock `fetchForecast` / `fetchAutoLocation` implementations.
> 3. Uncomment the "REAL IMPLEMENTATION" block at the bottom of the file.

## Features

- **Interactive Maps**: Uses `react-leaflet` to display dynamic, animated location pins that snap perfectly to searched coordinates.
- **Data Visualization**: Features a dual-axis chart built with `recharts`, visualizing temperature trends and rain probabilities.
- **Geocoding Autocomplete**: Integrates with the Open-Meteo geocoding API to seamlessly resolve town names into precise coordinates.
- **Smart "Farm Insights"**: Toggles AI-driven agricultural advice based on the forecast.
- **i18n Support**: Full English and Swahili localization.
- **Persistent History**: Uses Firebase Firestore to save and recall recent searches alongside their coordinates.

## Setup

```bash
cp .env.example .env
npm install
npm run dev      # starts on http://localhost:5173
```

By default the app talks to the backend at `http://localhost:5000` (once simulation mode is disabled).
Change `VITE_API_BASE_URL` in `.env` if your backend runs elsewhere.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No | Backend base URL. Defaults to `http://localhost:5000` |
| `VITE_FIREBASE_*` | No | Firebase web app config - enables "recent searches" history via Firestore |

Firebase variables are entirely optional. Without them, the app works fully - it just won't persist a recent-searches list across sessions.

## Build

```bash
npm run build    # type-checks and builds to dist/
npm run preview  # preview the production build locally
```

## Project structure

```
src/
├── components/
│   ├── SearchBar.tsx          # Autocomplete search
│   ├── CurrentConditions.tsx  # Current weather stats
│   ├── ForecastStrip.tsx      # Multi-day forecast UI
│   ├── TemperatureChart.tsx   # Dual-axis visualization (Recharts)
│   ├── WeatherMap.tsx         # Interactive Map (Leaflet)
│   ├── AiSummary.tsx          # Farm Insights display
│   ├── RecentSearches.tsx     # Firestore-backed history
│   └── StatusBanner.tsx       # Loading/Error states
├── lib/
│   ├── api.ts              # API client (currently handling Simulation Mode)
│   ├── firebase.ts         # Firebase client init (optional)
│   ├── i18n.ts             # Localization dictionaries
│   └── recentSearches.ts   # Firestore read/writes (includes lat/lon tracking)
├── types/
│   └── weather.ts          # shared TypeScript types
├── App.tsx
├── index.css               # Tailwind + design tokens
└── main.tsx
```
