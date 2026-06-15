import type { WeatherResponse } from "../types/weather";

interface AiSummaryProps {
  weather: WeatherResponse;
}

/**
 * Renders the Gemini-generated AI summary, if present in the response.
 * Falls back to nothing if the API was called with ai=false or the
 * summary field isn't present.
 */
export default function AiSummary({ weather }: AiSummaryProps) {
  const summary = weather.ai_summary || weather.summary || weather.insights?.summary;

  if (!summary) return null;

  return (
    <section className="rounded-2xl border border-leaf bg-leaf-light px-5 py-4">
      <h3 className="mb-1.5 text-base text-leaf">
        <span aria-hidden="true">✨</span> AI summary
      </h3>
      <p className="leading-relaxed text-ink">{summary}</p>
    </section>
  );
}
