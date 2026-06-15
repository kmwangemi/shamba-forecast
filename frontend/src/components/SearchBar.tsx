import { useState, type FormEvent } from "react";

interface SearchBarProps {
  onSearch: (town: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const town = value.trim();
    if (!town) return;
    onSearch(town);
  }

  return (
    <form className="flex gap-2.5" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter a town, e.g. Bomet"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Town name"
        className="flex-1 rounded-xl border border-border bg-cloud px-3.5 py-2.5 text-base text-ink focus-visible:outline-3 focus-visible:outline-amber focus-visible:outline-offset-2 focus-visible:border-sky-deep"
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="rounded-xl bg-sky-deep px-5 py-2.5 text-sm font-semibold text-cloud transition-colors hover:bg-sky-deep-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-amber focus-visible:outline-offset-2"
      >
        {loading ? "Searching…" : "Get forecast"}
      </button>
    </form>
  );
}
