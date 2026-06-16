import type { DailyForecastDay, WeatherResponse, SummaryLanguage } from "../types/weather";
import { t } from "../lib/i18n";

interface ForecastStripProps {
  weather: WeatherResponse;
  lang: SummaryLanguage;
}

/**
 * Renders a horizontal strip of daily forecast cards.
 *
 * Reads from `weather.daily` or `weather.forecast` (array of day objects),
 * with defensive field-name fallbacks - see note in CurrentConditions.tsx.
 */
export default function ForecastStrip({ weather, lang }: ForecastStripProps) {
  const forecastField = weather.forecast;
  const days: DailyForecastDay[] | undefined = Array.isArray(weather.daily)
    ? weather.daily
    : Array.isArray(forecastField)
      ? forecastField
      : forecastField && "forecastday" in forecastField
        ? forecastField.forecastday
        : undefined;

  if (!days || days.length === 0) return null;

  return (
    <section>
      <h3 className="mb-2.5 text-base">{days.length}-day {t("outlook", lang)}</h3>
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {days.map((day, idx) => {
          const date = day.date || (typeof day.day === "string" ? day.day : undefined);
          const dayObj = typeof day.day === "object" ? day.day : undefined;
          const max = day.temp_max ?? day.maxtemp_c ?? dayObj?.maxtemp_c;
          const min = day.temp_min ?? day.mintemp_c ?? dayObj?.mintemp_c;
          const conditionRaw = day.condition ?? dayObj?.condition;
          const condition =
            (typeof conditionRaw === "object" ? conditionRaw?.text : conditionRaw) ||
            day.weather_description;
          const rainChance =
            day.chance_of_rain ?? day.daily_chance_of_rain ?? day.precipitation_probability;

          return (
            <div
              key={date || idx}
              className="min-w-[92px] flex-none rounded-xl border border-border bg-cloud px-2.5 py-3 text-center"
            >
              <p className="mb-1 text-xs font-semibold text-sky-deep">
                {date
                  ? new Date(date).toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })
                  : `Day ${idx + 1}`}
              </p>
              {condition && (
                <p className="mb-1.5 min-h-[1.7em] text-[0.7rem] text-ink-soft">{condition}</p>
              )}
              <p className="flex justify-center gap-1.5 text-sm">
                {max !== undefined && <span className="font-bold">{Math.round(max)}°</span>}
                {min !== undefined && <span className="text-ink-soft">{Math.round(min)}°</span>}
              </p>
              {rainChance !== undefined && (
                <p className="mt-1.5 text-[0.72rem] text-sky-deep">💧 {rainChance}%</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
