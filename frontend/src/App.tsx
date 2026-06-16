import { useEffect, useState } from "react";
import { fetchForecast, fetchAutoLocation } from "./lib/api";
import { getRecentSearches, recordSearch, type RecentSearch } from "./lib/recentSearches";
import type { ForecastResponse, SummaryLanguage } from "./types/weather";
import SearchBar from "./components/SearchBar";
import CurrentConditions from "./components/CurrentConditions";
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
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);

  useEffect(() => {
    getRecentSearches().then(setRecent);
    
    // Auto-fetch location on first load
    if (!hasAutoFetched && !data && !loading && !error) {
      setHasAutoFetched(true);
      setLoading(true);
      fetchAutoLocation({ lang, ai: useAi })
        .then((result) => setData(result))
        .catch(() => {
          // Silent fail for auto-location, user can still search manually
        })
        .finally(() => setLoading(false));
    }
  }, [hasAutoFetched, data, loading, error, lang, useAi]);

  async function handleSearch(town: string) {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchForecast(town, { lang, ai: useAi });
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
            <h1 className="text-2xl tracking-tight">Shamba Forecast</h1>
            <p className="mt-0.5 text-sm text-ink-soft">
              Hyperlocal weather and farm guidance, powered by WeatherAI
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 text-sm text-ink-soft">
            <label htmlFor="ai-toggle">AI Advice</label>
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
                <span className="ml-2 text-sm font-medium text-ink">{useAi ? "On" : "Off"}</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-sm text-ink-soft">
            <label htmlFor="lang-select">Language</label>
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
        </div>
      </header>

      <main className="flex flex-col gap-5">
        <SearchBar onSearch={handleSearch} loading={loading} />

        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <span>Try:</span>
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

        <RecentSearches searches={recent} onSelect={handleSearch} disabled={loading} />

        {error && <StatusBanner type="error" message={error} />}
        {loading && <StatusBanner type="loading" message="Fetching forecast…" />}

        {data && !loading && (
          <>
            {data.meta.cache === "hit" && (
              <StatusBanner
                type="info"
                message="Served from cache - this location was fetched recently."
              />
            )}
            <CurrentConditions location={data.location} weather={data.weather} />
            <ForecastStrip weather={data.weather} />
            <AiSummary weather={data.weather} />
          </>
        )}

        {!data && !loading && !error && (
          <StatusBanner
            type="empty"
            message="Search for a town or pick one above to see the forecast."
          />
        )}
      </main>

      <footer className="mt-auto border-t border-border pt-4 text-center text-xs text-ink-soft">
        <p>
          Data from the WeatherAI API. Built as a demo integration showing caching,
          geocoding, Firestore-backed history, and resilient error handling.
        </p>
      </footer>
    </div>
  );
}

export default App;
