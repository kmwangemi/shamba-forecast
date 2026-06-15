interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  cachedAt: number;
}

interface CacheStats {
  size: number;
  ttlSeconds: number;
}

/**
 * A minimal in-memory cache with per-entry TTL (time to live).
 *
 * Why in-memory instead of Redis for this project:
 * - Single-instance deployment (Render/Railway free tier = one dyno),
 *   so there's no need for a shared cache across processes yet.
 * - Zero extra infrastructure to set up/deploy for a 48-hour assignment.
 *
 * If this were to run at scale across multiple instances, this class
 * would be swapped for a Redis-backed cache (e.g. via `ioredis`) with
 * the exact same get/set/has interface - the rest of the app wouldn't
 * need to change. See README "Scaling considerations" for more detail.
 */
export class TTLCache<T = unknown> {
  private ttlMs: number;
  private store: Map<string, CacheEntry<T>>;

  constructor(ttlSeconds = 900) {
    this.ttlMs = ttlSeconds * 1000;
    this.store = new Map();
  }

  /**
   * Build a normalized cache key from lat/lon (rounded to ~1.1km precision)
   * plus any params that affect the response shape (days, units, lang).
   */
  buildKey(lat: number, lon: number, extra: Record<string, unknown> = {}): string {
    const roundedLat = lat.toFixed(2);
    const roundedLon = lon.toFixed(2);
    const extraKey = Object.keys(extra)
      .sort()
      .map((k) => `${k}=${extra[k]}`)
      .join("&");
    return `${roundedLat},${roundedLon}${extraKey ? `|${extraKey}` : ""}`;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
      cachedAt: Date.now(),
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /** Returns basic stats - useful for a debug/health endpoint. */
  stats(): CacheStats {
    return {
      size: this.store.size,
      ttlSeconds: this.ttlMs / 1000,
    };
  }
}
