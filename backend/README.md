# Backend - Shamba Forecast API

Express + TypeScript API that wraps the [WeatherAI](https://weather-ai.co) `/v1/weather` endpoint with geocoding, in-memory caching, retry/backoff, and optional Firestore request logging.

## Setup

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```
WEATHERAI_API_KEY=wai_your_real_key
```

Then:

```bash
npm install
npm run dev      # starts on http://localhost:5000 with hot reload (tsx watch)
```

For a production build:

```bash
npm run build    # compiles TypeScript to dist/
npm start        # runs dist/server.js
```

> [!NOTE]
> If you are working on the frontend and it appears not to be calling the backend, please check `frontend/src/lib/api.ts` to ensure the frontend is not currently set to "Simulation Mode".

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `WEATHERAI_API_KEY` | Yes | API key from the WeatherAI developer dashboard |
| `WEATHERAI_BASE_URL` | No | Defaults to `https://api.weather-ai.co` |
| `PORT` | No | Defaults to `5000` |
| `CACHE_TTL_SECONDS` | No | Defaults to `900` (15 min) |
| `CORS_ORIGIN` | No | Defaults to `*`. Set to your frontend URL in production |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | No | Full service account JSON as one line (for Firestore logging) |
| `GOOGLE_APPLICATION_CREDENTIALS` | No | Path to a service account JSON file (alternative to above) |
| `FIREBASE_PROJECT_ID` | No | Used with `GOOGLE_APPLICATION_CREDENTIALS` |

If neither Firebase env var is set, the app runs normally - Firestore logging is just skipped silently.

## Endpoints

### `GET /api/forecast`

Query params:

- `town` (string) - a place name, e.g. `Bomet`. **OR** provide `lat`/`lon` directly.
- `lat`, `lon` (number) - precise geographical coordinates. If provided, `town` name resolution is bypassed.
- `days` (number, default `7`)
- `units` (`metric` | `imperial`, default `metric`)
- `lang` (`en` | `sw`, default `en`)
- `ai` (`true` | `false`, default `true`)

Example:

```
GET /api/forecast?town=Bomet&lang=sw
```

Response:

```json
{
  "location": { "name": "Bomet, Kenya", "lat": -0.78, "lon": 35.34 },
  "weather": { "...": "raw WeatherAI response" },
  "meta": { "cache": "miss", "rateLimit": { "...": "..." }, "fetchedAt": "..." }
}
```

### `GET /api/forecast/auto`

Automatically attempts to resolve the request origin IP to a set of coordinates, then fetches weather for that location. Used for the initial page load when browser geolocation is denied or unavailable.

### `GET /api/cache-stats`

Returns `{ size, ttlSeconds }` - useful to confirm in-memory caching is working.

### `GET /api/health`

Returns server status, cache stats, and Firebase connection status.

## Architecture & Error handling

- **Geocoding**: If a `town` is provided without `lat`/`lon`, the backend transparently intercepts the request, calls the Open-Meteo Geocoding API, extracts the coordinates, and then forwards the exact location to WeatherAI.
- **400** - missing `town` or `lat`/`lon`
- **404** - geocoding couldn't resolve the town name
- **401/403** - invalid/missing WeatherAI API key
- **429** - WeatherAI rate limit exceeded (rate limit headers passed through)
- **502/503** - WeatherAI upstream unavailable after retries
