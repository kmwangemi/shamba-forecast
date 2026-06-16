import type { RecentSearch } from "../lib/recentSearches";
import type { SummaryLanguage } from "../types/weather";
import { t } from "../lib/i18n";

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSelect: (town: string) => void;
  disabled: boolean;
  lang: SummaryLanguage;
}

/**
 * Shows the user's last few searches, pulled from Firestore. Renders
 * nothing if there's no history yet (e.g. Firebase not configured, or
 * first-ever visit).
 */
export default function RecentSearches({ searches, onSelect, disabled, lang }: RecentSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
      <span>{t("recentSearches", lang)}:</span>
      {searches.map((search) => (
        <button
          key={search.id}
          type="button"
          onClick={() => onSelect(search.town)}
          disabled={disabled}
          className="rounded-full border border-border bg-cloud px-3 py-1 text-sm text-sky-deep transition-colors hover:border-leaf hover:bg-leaf-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {search.town}
        </button>
      ))}
    </div>
  );
}
