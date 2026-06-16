import { useState, type FormEvent } from "react";
import AsyncSelect from "react-select/async";

import type { SummaryLanguage } from "../types/weather";
import { t } from "../lib/i18n";

interface OptionType {
  value: string;
  label: string;
}

interface SearchBarProps {
  onSearch: (town: string, lat?: number, lon?: number) => void;
  loading: boolean;
  lang: SummaryLanguage;
  selectedOption: OptionType | null;
  onOptionChange: (option: OptionType | null) => void;
}

const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    borderRadius: '0.75rem',
    border: state.isFocused ? '1px solid #005f73' : '1px solid #e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 1px #005f73' : 'none',
    padding: '2px',
    backgroundColor: '#f8fafc',
    fontSize: '1rem',
    minHeight: '44px',
    '&:hover': {
      border: state.isFocused ? '1px solid #005f73' : '1px solid #d1d5db',
    }
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    zIndex: 50,
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#005f73' : state.isFocused ? '#e0f2fe' : 'white',
    color: state.isSelected ? 'white' : '#1e293b',
    '&:hover': {
      backgroundColor: state.isSelected ? '#005f73' : '#e0f2fe',
    }
  })
};

export default function SearchBar({ onSearch, loading, lang, selectedOption, onOptionChange }: SearchBarProps) {
  async function loadOptions(inputValue: string): Promise<OptionType[]> {
    if (!inputValue || inputValue.trim().length < 2) return [];
    
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(inputValue.trim())}&count=5&language=${lang === 'sw' ? 'en' : 'en'}&format=json`);
      const data = await res.json();
      
      if (!data.results) return [];
      
      return data.results.map((r: any) => {
        const fullTown = [r.name, r.admin1, r.country].filter(Boolean).join(", ");
        return {
          value: JSON.stringify({ town: fullTown, lat: r.latitude, lon: r.longitude }),
          label: fullTown
        };
      });
    } catch (e) {
      console.error("Autocomplete error:", e);
      return [];
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedOption) return;
    try {
      const parsed = JSON.parse(selectedOption.value);
      onSearch(parsed.town, parsed.lat, parsed.lon);
    } catch {
      onSearch(selectedOption.value);
    }
  }

  return (
    <form className="flex gap-2.5 items-start" onSubmit={handleSubmit}>
      <div className="flex-1 text-base z-50">
        <AsyncSelect
          cacheOptions
          loadOptions={loadOptions}
          defaultOptions={false}
          value={selectedOption}
          onChange={(option) => onOptionChange(option as OptionType)}
          placeholder={t("searchPlaceholder", lang)}
          noOptionsMessage={() => lang === 'sw' ? "Hakuna matokeo" : "No results found"}
          loadingMessage={() => lang === 'sw' ? "Inatafuta..." : "Loading..."}
          styles={customStyles}
          isDisabled={loading}
          isClearable
          components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !selectedOption}
        className="cursor-pointer rounded-xl bg-sky-deep px-5 py-2.5 mt-[2px] text-sm font-semibold text-cloud transition-colors hover:bg-sky-deep-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-amber focus-visible:outline-offset-2"
      >
        {loading ? t("searching", lang) : t("getForecast", lang)}
      </button>
    </form>
  );
}
