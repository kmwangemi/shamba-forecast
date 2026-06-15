import type { StatusBannerType } from "../types/weather";

interface StatusBannerProps {
  type?: StatusBannerType;
  message: string;
}

const ICONS: Record<StatusBannerType, string> = {
  error: "⚠️",
  loading: "⏳",
  info: "ℹ️",
  empty: "🔍",
};

const STYLES: Record<StatusBannerType, string> = {
  error: "bg-error-bg text-error-text",
  loading: "bg-leaf-light text-leaf",
  info: "bg-sky text-sky-deep",
  empty: "bg-cloud border border-dashed border-border text-ink-soft",
};

export default function StatusBanner({ type = "info", message }: StatusBannerProps) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${STYLES[type]}`}
      role="status"
    >
      <span aria-hidden="true">{ICONS[type]}</span>
      <p className="m-0">{message}</p>
    </div>
  );
}
