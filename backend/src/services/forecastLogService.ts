import { db, isFirebaseConfigured } from "../config/firebase";

export interface ForecastLogEntry {
  town: string | null;
  lat: number;
  lon: number;
  cacheStatus: "hit" | "miss";
  requestedAt: Date;
}

const COLLECTION = "forecastRequests";

/**
 * Log a forecast request to Firestore for basic analytics/debugging
 * (e.g. "what locations are people searching, and how often do we hit
 * cache vs call the upstream API"). No-ops silently if Firebase isn't
 * configured, so this never blocks the main forecast flow.
 */
export async function logForecastRequest(entry: ForecastLogEntry): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  try {
    await db.collection(COLLECTION).add({
      ...entry,
      requestedAt: entry.requestedAt.toISOString(),
    });
  } catch (err) {
    console.warn("[firestore] failed to log forecast request:", (err as Error).message);
  }
}
