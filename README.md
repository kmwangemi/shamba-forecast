# Shamba Forecast

A hyper-local weather and farm guidance dashboard built to demonstrate a full-stack integration with the [WeatherAI API](https://weather-ai.co).

🚀 **[A live deployment link showing the project in action hosted on Vercel](https://shamba-forecast.vercel.app)**

This repository contains two primary components:
1. A robust **Node/Express Backend** handling API requests, geocoding, and in-memory rate-limit caching.
2. A beautiful, responsive **React/Vite Frontend** featuring dynamic maps, interactive charts, and i18n support.

## Project structure

```
shamba-forecast/
├── backend/    # Express + TypeScript API wrapper around WeatherAI
└── frontend/   # React + TypeScript + Tailwind dashboard UI
```

Each folder has its own detailed README with setup instructions:
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Add your WEATHERAI_API_KEY to .env
npm install
npm run dev
```

Runs on `http://localhost:5000` by default.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Runs on `http://localhost:5173` by default and talks to the backend at `VITE_API_BASE_URL` (defaults to `http://localhost:5000`).

## Architecture Highlights

- **API Security**: The frontend never calls the WeatherAI API directly - all requests are securely proxied through the Express backend, which holds the API key.
- **Geocoding Abstraction**: The backend intercepts location names and resolves them to exact coordinates via Open-Meteo's free geocoding API, ensuring compliance with WeatherAI's strict lat/lon requirements.
- **Rate-limit Resilience**: Responses are cached in-memory per location (rounded to ~1.1km precision) for a configurable `CACHE_TTL_SECONDS` (default 15 min). This drastically reduces redundant upstream calls for overlapping geographic areas.
- **Smart Retries**: Transient upstream errors (500/503/network) are automatically retried with exponential backoff. Permanent errors (401/403/429) are surfaced immediately to the frontend.
- **Firestore Integration (Optional)**: If Firebase credentials are provided, forecast requests are logged securely on the backend, and user searches are stored on the frontend to populate an interactive "Recent Searches" history. Both gracefully degrade if Firebase is omitted.

## Scaling considerations

- **Free-tier management**: The in-memory cache ensures that repeated requests for the identical locations (e.g. farmers in the same cooperative) only hit the API once per TTL window. 
- **Redis Swap**: The cache is currently in-memory and per-process. If deployed across multiple server instances, the `TTLCache` utility class can be seamlessly swapped for a Redis-backed implementation using the exact same interface.
- **Webhooks vs Polling**: For high-volume production use on paid tiers, the backend architecture could be extended to subscribe to WeatherAI push updates for heavily trafficked regions rather than polling on a per-request basis.
