import { useEffect, useState, useRef } from "react";
import { fetchForecast, fetchAutoLocation } from "./lib/api";
import { getRecentSearches, recordSearch, type RecentSearch } from "./lib/recentSearches";
import type { ForecastResponse, SummaryLanguage } from "./types/weather";
import { t } from "./lib/i18n";
import SearchBar from "./components/SearchBar";
import CurrentConditions from "./components/CurrentConditions";
import WeatherMap from "./components/WeatherMap";
import ForecastStrip from "./components/ForecastStrip";
import TemperatureChart from "./components/TemperatureChart";
import AiSummary from "./components/AiSummary";
import StatusBanner from "./components/StatusBanner";
import RecentSearches from "./components/RecentSearches";

function App() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<SummaryLanguage>("en");
  const [useAi, setUseAi] = useState(true);
  const [days, setDays] = useState(7);
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<{ type: 'town' | 'auto'; town?: string; lat?: number; lon?: number } | null>(null);
  const [mapCoords, setMapCoords] = useState<[number, number] | null>(null);
  const [searchOption, setSearchOption] = useState<{ value: string; label: string } | null>(null);
  
  const currentQueryRef = useRef(currentQuery);
  useEffect(() => {
    currentQueryRef.current = currentQuery;
  }, [currentQuery]);

  useEffect(() => {
    // Try precise geolocation on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // If the user has already manually searched by the time they click "Allow", ignore it.
          if (currentQueryRef.current?.type !== 'town') {
            setMapCoords([pos.coords.latitude, pos.coords.longitude]);
          }
        },
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
      await recordSearch(town, lat, lon);
      setRecent(await getRecentSearches());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectCity(town: string, lat?: number, lon?: number) {
    setSearchOption({ value: JSON.stringify({ town, lat, lon }), label: town });
    handleSearch(town, lat, lon);
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
            <label htmlFor="days-select" className="cursor-pointer">{t("forecastDays", lang)}</label>
            <select
              id="days-select"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="cursor-pointer rounded-lg border border-border bg-cloud px-2 py-1.5 text-sm text-ink"
            >
              <option value={1}>{t("day1", lang)}</option>
              <option value={3}>{t("day3", lang)}</option>
              <option value={7}>{t("day7", lang)}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 text-sm text-ink-soft">
            <label htmlFor="ai-toggle" className="cursor-pointer">{t("aiAdvice", lang)}</label>
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
            <label htmlFor="lang-select" className="cursor-pointer">{t("language", lang)}</label>
            <select
              id="lang-select"
              value={lang}
              onChange={(e) => setLang(e.target.value as SummaryLanguage)}
              className="cursor-pointer rounded-lg border border-border bg-cloud px-2 py-1.5 text-sm text-ink"
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
            </select>
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-5">
        <SearchBar 
          onSearch={handleSearch} 
          loading={loading} 
          lang={lang} 
          selectedOption={searchOption}
          onOptionChange={setSearchOption}
        />

        <RecentSearches searches={recent} onSelect={handleSelectCity} disabled={loading} lang={lang} />

        {mapCoords && (
          <div className={loading ? "opacity-60 transition-opacity pointer-events-none" : "transition-opacity"}>
            <WeatherMap lat={mapCoords[0]} lon={mapCoords[1]} name={data?.location?.name !== "Auto Location" ? (data?.location?.name ?? undefined) : "Nairobi"} />
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
            <TemperatureChart weather={data.weather} lang={lang} />
            {useAi && <AiSummary weather={data.weather} lang={lang} />}
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
