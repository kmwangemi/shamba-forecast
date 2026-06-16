import { useEffect, useState } from "react";
import { fetchForecast, fetchAutoLocation } from "./lib/api";
import { getRecentSearches, recordSearch, type RecentSearch } from "./lib/recentSearches";
import type { ForecastResponse, SummaryLanguage } from "./types/weather";
import { t } from "./lib/i18n";
import SearchBar from "./components/SearchBar";
import CurrentConditions from "./components/CurrentConditions";
import WeatherMap from "./components/WeatherMap";
import ForecastStrip from "./components/ForecastStrip";
import AiSummary from "./components/AiSummary";
import StatusBanner from "./components/StatusBanner";
import RecentSearches from "./components/RecentSearches";

const DEFAULT_TOWNS = ["Nairobi", "Bomet", "Eldoret", "Mombasa", "Kisumu"];

function App() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<SummaryLanguage>("en");
  const [useAi, setUseAi] = useState(false);
  const [days, setDays] = useState(7);
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<{ type: 'town' | 'auto'; town?: string; lat?: number; lon?: number } | null>(null);
  const [mapCoords, setMapCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Try precise geolocation on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMapCoords([pos.coords.latitude, pos.coords.longitude]),
        () => {} // Silent fail, we'll fall back to IP auto-location
      );
    }
    getRecentSearches().then(setRecent);
    
    // Auto-fetch location on first load
    if (!hasAutoFetched && !data && !loading && !error) {
      setHasAutoFetched(true);
      setCurrentQuery({ type: 'auto' });
      setLoading(true);
      fetchAutoLocation({ lang, ai: useAi, days })
        .then((result) => setData(result))
        .catch(() => {
          // Silent fail for auto-location, user can still search manually
        })
        .finally(() => setLoading(false));
    }
  }, [hasAutoFetched, data, loading, error, lang, useAi, days]);

  // Refetch when lang, useAi, or days changes
  useEffect(() => {
    if (!currentQuery) return;
    
    setLoading(true);
    if (currentQuery.type === 'town' && currentQuery.town) {
      fetchForecast(currentQuery.town, { lang, ai: useAi, days, lat: currentQuery.lat, lon: currentQuery.lon })
        .then((result) => setData(result))
        .catch((err) => setError(err instanceof Error ? err.message : t("errorGeneric", lang)))
        .finally(() => setLoading(false));
    } else if (currentQuery.type === 'auto') {
      fetchAutoLocation({ lang, ai: useAi, days })
        .then((result) => setData(result))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [lang, useAi, days]); // Deliberately omit currentQuery to avoid double-fetching on search

  // Sync map coordinates when data arrives
  useEffect(() => {
    if (data?.location?.lat !== undefined && data?.location?.lon !== undefined) {
      setMapCoords([data.location.lat, data.location.lon]);
    }
  }, [data]);

  async function handleSearch(town: string, lat?: number, lon?: number) {
    setLoading(true);
    setError(null);
    setCurrentQuery({ type: 'town', town, lat, lon });
    try {
      const result = await fetchForecast(town, { lang, ai: useAi, days, lat, lon });
      setData(result);
      await recordSearch(town);
      setRecent(await getRecentSearches());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-5 pb-12 pt-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3.5">
          <span className="text-4xl leading-none" aria-hidden="true">
            ⛅
          </span>
          <div>
            <h1 className="text-2xl tracking-tight">{t("title", lang)}</h1>
            <p className="mt-0.5 text-sm text-ink-soft">
              {t("subtitle", lang)}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 text-sm text-ink-soft">
            <label htmlFor="ai-toggle">{t("aiAdvice", lang)}</label>
            <div className="flex items-center h-8">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  id="ai-toggle"
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={useAi}
                  onChange={(e) => setUseAi(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-deep"></div>
                <span className="ml-2 text-sm font-medium text-ink">{useAi ? t("on", lang) : t("off", lang)}</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-sm text-ink-soft">
            <label htmlFor="lang-select">{t("language", lang)}</label>
            <select
              id="lang-select"
              value={lang}
              onChange={(e) => setLang(e.target.value as SummaryLanguage)}
              className="rounded-lg border border-border bg-cloud px-2 py-1.5 text-sm text-ink"
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 text-sm text-ink-soft">
            <label htmlFor="days-select">{t("forecastDays", lang)}</label>
            <select
              id="days-select"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-lg border border-border bg-cloud px-2 py-1.5 text-sm text-ink"
            >
              <option value={1}>{t("day1", lang)}</option>
              <option value={3}>{t("day3", lang)}</option>
              <option value={7}>{t("day7", lang)}</option>
            </select>
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-5">
        <SearchBar onSearch={handleSearch} loading={loading} lang={lang} />

        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <span>{t("tryPrompt", lang)}</span>
          {DEFAULT_TOWNS.map((town) => (
            <button
              key={town}
              type="button"
              onClick={() => handleSearch(town)}
              disabled={loading}
              className="rounded-full border border-border bg-cloud px-3 py-1 text-sm text-sky-deep transition-colors hover:border-leaf hover:bg-leaf-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {town}
            </button>
          ))}
        </div>

        <RecentSearches searches={recent} onSelect={handleSearch} disabled={loading} lang={lang} />

        {mapCoords && (
          <div className={loading ? "opacity-60 transition-opacity pointer-events-none" : "transition-opacity"}>
            <WeatherMap lat={mapCoords[0]} lon={mapCoords[1]} />
          </div>
        )}

        {error && <StatusBanner type="error" message={error} />}
        {loading && <StatusBanner type="loading" message={t("fetching", lang)} />}

        {data && !loading && (
          <>
            {data.meta.cache === "hit" && (
              <StatusBanner
                type="info"
                message={t("cacheHit", lang)}
              />
            )}
            <CurrentConditions location={data.location} weather={data.weather} lang={lang} />
            <ForecastStrip weather={data.weather} lang={lang} />
            <AiSummary weather={data.weather} lang={lang} />
          </>
        )}

        {!data && !loading && !error && (
          <StatusBanner
            type="empty"
            message={t("emptySearch", lang)}
          />
        )}
      </main>

      <footer className="mt-auto border-t border-border pt-4 text-center text-xs text-ink-soft">
        <p>{t("footer", lang)}</p>
      </footer>
    </div>
  );
}

export default App;
