import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DailyForecastDay, WeatherResponse, SummaryLanguage } from "../types/weather";
import { t } from "../lib/i18n";

interface TemperatureChartProps {
  weather: WeatherResponse;
  lang: SummaryLanguage;
}

export default function TemperatureChart({ weather, lang }: TemperatureChartProps) {
  const forecastField = weather.forecast;
  const days: DailyForecastDay[] | undefined = Array.isArray(weather.daily)
    ? weather.daily
    : Array.isArray(forecastField)
      ? forecastField
      : forecastField && "forecastday" in forecastField
        ? forecastField.forecastday
        : undefined;

  if (!days || days.length === 0) return null;

  const chartData = days.map((day, idx) => {
    const dateStr = day.date || (typeof day.day === "string" ? day.day : undefined);
    const dayObj = typeof day.day === "object" ? day.day : undefined;
    const max = day.temp_max ?? day.maxtemp_c ?? dayObj?.maxtemp_c;
    const min = day.temp_min ?? day.mintemp_c ?? dayObj?.mintemp_c;
    const rain = day.chance_of_rain ?? day.daily_chance_of_rain ?? day.precipitation_probability ?? (dayObj as any)?.daily_chance_of_rain ?? 0;

    const formattedDate = dateStr 
      ? new Date(dateStr).toLocaleDateString(lang === 'sw' ? 'sw-KE' : 'en-US', { weekday: "short" })
      : `D${idx + 1}`;

    return {
      name: formattedDate,
      max: max !== undefined ? Math.round(max) : null,
      min: min !== undefined ? Math.round(min) : null,
      rain: rain
    };
  });

  return (
    <section className="rounded-2xl border border-border bg-cloud px-6 py-5">
      <h3 className="mb-4 text-base">{t("tempTrend", lang)}</h3>
      <div className="h-64 w-full" style={{ minWidth: 0, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar yAxisId="right" dataKey="rain" name={t("rainChance", lang)} fill="#93c5fd" radius={[4, 4, 0, 0]} barSize={20} />
            <Area yAxisId="left" type="monotone" dataKey="max" name={t("maxTemp", lang)} stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorMax)" />
            <Area yAxisId="left" type="monotone" dataKey="min" name={t("minTemp", lang)} stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorMin)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
