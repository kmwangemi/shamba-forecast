# Frontend - Shamba Forecast

React + TypeScript + Vite + Tailwind CSS dashboard for the WeatherAI demo
integration.

## Setup

```bash
cp .env.example .env
npm install
npm run dev      # starts on http://localhost:5173
```

By default the app talks to the backend at `http://localhost:5000`.
Change `VITE_API_BASE_URL` in `.env` if your backend runs elsewhere.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No | Backend base URL. Defaults to `http://localhost:5000` |
| `VITE_FIREBASE_*` | No | Firebase web app config - enables "recent searches" history via Firestore |

Firebase variables are entirely optional. Without them, the app works
fully - it just won't persist a recent-searches list across sessions.

## Build

```bash
npm run build    # type-checks and builds to dist/
npm run preview  # preview the production build locally
```

## Project structure

```
src/
├── components/
│   ├── SearchBar.tsx
│   ├── CurrentConditions.tsx
│   ├── ForecastStrip.tsx
│   ├── AiSummary.tsx
│   ├── RecentSearches.tsx
│   └── StatusBanner.tsx
├── lib/
│   ├── api.ts             # fetch wrapper for the backend
│   ├── firebase.ts         # Firebase client init (optional)
│   └── recentSearches.ts   # Firestore-backed search history
├── types/
│   └── weather.ts          # shared TypeScript types
├── App.tsx
├── index.css                # Tailwind + design tokens
└── main.tsx
```

## Notes on the WeatherAI response shape

The components in `src/components/` read the WeatherAI response
defensively (checking a few plausible field names like `current` vs
`current_weather`, `daily` vs `forecast.forecastday`, etc.), since the
public docs don't show a full example response body. Once you've made a
real request against `/v1/weather`, you may want to tighten
`src/types/weather.ts` and the components to match the exact field
names returned.
