import type {
  CurrentConditions as CurrentConditionsData,
  Location,
  WeatherResponse,
} from "../types/weather";

interface CurrentConditionsProps {
  location: Location;
  weather: WeatherResponse;
}

/**
 * Renders "current conditions" for a location.
 *
 * NOTE: The WeatherAI docs don't publish a full example response body for
 * /v1/weather, so this component reads from a few plausible field names
 * defensively (e.g. `weather.current` vs top-level fields). Once you've
 * made a real request, trim this down to the actual field names you see.
 */
export default function CurrentConditions({ location, weather }: CurrentConditionsProps) {
  const current: CurrentConditionsData =
    weather.current || weather.current_weather || (weather as CurrentConditionsData);

  if (!current) return null;

  const temp = current.temperature ?? current.temp ?? current.temp_c;
  const feelsLike = current.feels_like ?? current.feelslike_c;
  const conditionRaw = current.condition;
  const condition: string | undefined =
    (typeof conditionRaw === "object" && conditionRaw !== null
      ? conditionRaw.text
      : conditionRaw) || current.weather_description;
  const humidity = current.humidity;
  const wind = current.wind_speed ?? current.wind_kph ?? current.windspeed;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-cloud px-6 py-5">
      <div>
        <h2 className="text-xl">{location.name || "Current location"}</h2>
        {location.lat !== undefined && location.lon !== undefined && (
          <p className="mt-0.5 text-xs tabular-nums text-ink-soft">
            {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-5">
        {temp !== undefined && (
          <span className="font-display text-5xl font-bold leading-none text-sky-deep">
            {Math.round(temp)}°
          </span>
        )}
        <div>
          {condition && <p className="mb-1.5 text-base font-semibold">{condition}</p>}
          <ul className="flex flex-wrap gap-3 text-sm text-ink-soft">
            {feelsLike !== undefined && <li>Feels like {Math.round(feelsLike)}°</li>}
            {humidity !== undefined && <li>Humidity {humidity}%</li>}
            {wind !== undefined && <li>Wind {wind} km/h</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}
