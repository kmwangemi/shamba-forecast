# Backend - Shamba Forecast API

Express + TypeScript API that wraps the [WeatherAI](https://weather-ai.co)
`/v1/weather` endpoint with geocoding, in-memory caching, retry/backoff,
and optional Firestore request logging.

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

If neither Firebase env var is set, the app runs normally - Firestore
logging is just skipped.

## Endpoints

### `GET /api/forecast`

Query params:

- `town` (string) - a place name, e.g. `Bomet`. **OR** provide `lat`/`lon` directly.
- `lat`, `lon` (number) - coordinates, used instead of `town`.
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

### `GET /api/cache-stats`

Returns `{ size, ttlSeconds }` - useful to confirm caching is working.

### `GET /api/health`

Returns server status, cache stats, and Firebase connection status.

## Project structure

```
src/
├── config/
│   └── firebase.ts        # Firebase Admin init (optional)
├── middleware/
│   └── errorHandler.ts    # Centralized error handling
├── routes/
│   └── forecast.ts        # /api/forecast and /api/cache-stats
├── services/
│   ├── geocodingService.ts  # Town name -> lat/lon (Open-Meteo)
│   ├── weatherAiClient.ts   # WeatherAI API client with retry/backoff
│   └── forecastLogService.ts # Firestore request logging
├── utils/
│   └── ttlCache.ts         # In-memory TTL cache
└── server.ts                # Express app entrypoint
```

## Error handling

- **400** - missing `town` or `lat`/`lon`
- **404** - geocoding couldn't resolve the town name
- **401/403** - invalid/missing WeatherAI API key
- **429** - WeatherAI rate limit exceeded (rate limit headers passed through)
- **502/503** - WeatherAI upstream unavailable after retries
