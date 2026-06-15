# Shamba Forecast

A small full-stack demo integration with the [WeatherAI](https://weather-ai.co) API,
built as a take-home assignment. It shows a hyperlocal weather dashboard
(current conditions, 7-day forecast, and AI-generated summary) for any
town, with backend caching, geocoding, retry/backoff, and optional
Firestore-backed request history.

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Firebase (Firestore) - optional, used for request logging
  and recent-search history

## Project structure

```
weatherai-dashboard/
├── backend/    # Express + TypeScript API wrapper around WeatherAI
└── frontend/   # React + TypeScript + Tailwind dashboard UI
```

Each folder has its own README with setup instructions.

## Quick start

1. **Backend**

   ```bash
   cd backend
   cp .env.example .env
   # Add your WEATHERAI_API_KEY to .env
   npm install
   npm run dev
   ```

   Runs on `http://localhost:5000` by default.

2. **Frontend**

   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

   Runs on `http://localhost:5173` by default and talks to the backend
   at `VITE_API_BASE_URL` (defaults to `http://localhost:5000`).

## Architecture overview

- The frontend never calls the WeatherAI API directly - all requests go
  through the Express backend, which holds the API key.
- The backend resolves town names to coordinates via Open-Meteo's free
  geocoding API (WeatherAI's `/v1/weather` endpoint requires lat/lon).
- Responses are cached in-memory per location (rounded to ~1.1km
  precision) for `CACHE_TTL_SECONDS` (default 15 min), to avoid hitting
  the WeatherAI API repeatedly for the same area and to stay within the
  free-tier rate limit.
- Transient upstream errors (500/503/network) are retried with
  exponential backoff; permanent errors (401/403/429) are surfaced
  immediately with the WeatherAI rate-limit headers attached.
- If Firebase credentials are configured, each forecast request is
  logged to Firestore (`forecastRequests` collection) and the frontend
  reads a small "recent searches" list (`recentSearches` collection).
  Both features degrade gracefully if Firebase isn't set up - the app
  works fully without it.

## Scaling considerations

- **Free-tier rate limit**: the in-memory cache means repeated requests
  for the same location (e.g. multiple farmers near each other) only
  hit the WeatherAI API once per TTL window. For the AI summary
  specifically, `ai=false` could be used on cache misses for
  low-priority background refreshes, reserving AI quota for
  user-initiated lookups.
- **Multi-instance deployment**: the cache is currently in-memory and
  per-process. If this were deployed across multiple instances, the
  `TTLCache` class (in `backend/src/utils/ttlCache.ts`) would be swapped
  for a Redis-backed implementation with the same `get`/`set`/`has`
  interface - no other code would need to change.
- **Webhooks vs polling**: on WeatherAI's paid tiers with webhook
  support, the backend could subscribe to push updates for frequently
  requested locations instead of polling on each request.
