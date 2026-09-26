"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { createIgdbCatalogClient } from "@/features/api/igdb-catalog-client";
import { usePreferences } from "@/features/preferences/preferences-provider";
import type {
  IgdbGameSuggestion,
  IgdbPlatformSuggestion,
} from "@/shared/api/igdb";

export type AppliedCatalogFilters = {
  name?: string;
  platformId?: number;
  yearFrom?: number;
  yearTo?: number;
};

export type CatalogSuggestion = {
  id?: number;
  name: string;
};

export type CatalogSuggestionProvider = {
  getGameSuggestions: (
    query: string,
    signal?: AbortSignal,
  ) => Promise<readonly CatalogSuggestion[]>;
  getPlatformSuggestions: (
    query: string,
    signal?: AbortSignal,
  ) => Promise<readonly CatalogSuggestion[]>;
};

type CatalogFiltersProps = {
  heading?: string;
  onApply: (filters: AppliedCatalogFilters) => void;
  suggestionProvider?: CatalogSuggestionProvider;
  eyebrow?: string;
};

export function CatalogFilters({
  eyebrow,
  heading,
  onApply,
  suggestionProvider,
}: CatalogFiltersProps) {
  const { copy } = usePreferences();
  const defaultSuggestionProvider = useMemo(
    () => createIgdbSuggestionProvider(),
    [],
  );
  const resolvedSuggestionProvider =
    suggestionProvider ?? defaultSuggestionProvider;
  const [name, setName] = useState("");
  const [platformQuery, setPlatformQuery] = useState("");
  const [platformId, setPlatformId] = useState<number>();
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [gameSuggestions, setGameSuggestions] = useState<CatalogSuggestion[]>(
    [],
  );
  const [gameSuggestionQuery, setGameSuggestionQuery] = useState("");
  const [selectedGameName, setSelectedGameName] = useState("");
  const [platformSuggestions, setPlatformSuggestions] = useState<
    CatalogSuggestion[]
  >([]);
  const [platformSuggestionQuery, setPlatformSuggestionQuery] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    const query = name.trim();
    if (query.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void resolvedSuggestionProvider
        .getGameSuggestions(query, controller.signal)
        .then((suggestions) => {
          if (!controller.signal.aborted) {
            setGameSuggestions([...suggestions]);
            setGameSuggestionQuery(query);
          }
        })
        .catch(() => undefined);
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [name, resolvedSuggestionProvider]);

  useEffect(() => {
    const query = platformQuery.trim();
    if (query.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void resolvedSuggestionProvider
        .getPlatformSuggestions(query, controller.signal)
        .then((suggestions) => {
          if (!controller.signal.aborted) {
            setPlatformSuggestions([...suggestions]);
            setPlatformSuggestionQuery(query);
          }
        })
        .catch(() => undefined);
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [platformQuery, resolvedSuggestionProvider]);

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const from = parseYear(yearFrom);
    const to = parseYear(yearTo);

    if (platformQuery.trim() && platformId === undefined) {
      setValidationMessage(copy.catalog.choosePlatform);
      return;
    }

    if (
      (yearFrom && from === undefined) ||
      (yearTo && to === undefined) ||
      (from !== undefined && to !== undefined && from > to)
    ) {
      setValidationMessage(copy.catalog.invalidYearRange);
      return;
    }

    setValidationMessage("");
    setGameSuggestions([]);
    setPlatformSuggestions([]);
    onApply({
      name: name.trim() || undefined,
      platformId,
      yearFrom: from,
      yearTo: to,
    });
  };

  const clearFilters = () => {
    setName("");
    setPlatformQuery("");
    setPlatformId(undefined);
    setYearFrom("");
    setYearTo("");
    setGameSuggestions([]);
    setPlatformSuggestions([]);
    setValidationMessage("");
    onApply({});
  };

  return (
    <form className="catalog-filters" onSubmit={applyFilters}>
      <div className="catalog-filters__heading">
        <p className="catalog-filters__kicker">
          {eyebrow ?? copy.catalog.eyebrow}
        </p>
        <h2>{heading ?? copy.catalog.filters}</h2>
      </div>

      <div className="catalog-filters__fields">
        <SuggestionField
          id="catalog-name"
          label={copy.catalog.name}
          suggestions={
            selectedGameName !== name.trim() &&
            gameSuggestionQuery === name.trim()
              ? gameSuggestions
              : []
          }
          value={name}
          onChange={(value) => {
            setName(value);
            setSelectedGameName("");
          }}
          onSelect={(suggestion) => {
            setName(suggestion.name);
            setSelectedGameName(suggestion.name);
            setGameSuggestions([]);
          }}
        />
        <SuggestionField
          id="catalog-platform"
          label={copy.catalog.platform}
          suggestions={
            platformId === undefined &&
            platformSuggestionQuery === platformQuery.trim()
              ? platformSuggestions
              : []
          }
          value={platformQuery}
          onChange={(value) => {
            setPlatformQuery(value);
            setPlatformId(undefined);
          }}
          onSelect={(suggestion) => {
            setPlatformQuery(suggestion.name);
            if (suggestion.id !== undefined) {
              setPlatformId(suggestion.id);
            }
            setPlatformSuggestions([]);
          }}
        />
        <label className="catalog-filter-field" htmlFor="catalog-year-from">
          <span>{copy.catalog.yearFrom}</span>
          <input
            id="catalog-year-from"
            inputMode="numeric"
            max="9999"
            min="1"
            onChange={(event) => setYearFrom(event.target.value)}
            placeholder="YYYY"
            type="number"
            value={yearFrom}
          />
        </label>
        <label className="catalog-filter-field" htmlFor="catalog-year-to">
          <span>{copy.catalog.yearTo}</span>
          <input
            id="catalog-year-to"
            inputMode="numeric"
            max="9999"
            min="1"
            onChange={(event) => setYearTo(event.target.value)}
            placeholder="YYYY"
            type="number"
            value={yearTo}
          />
        </label>
      </div>

      {validationMessage ? (
        <p className="catalog-filters__validation" role="alert">
          {validationMessage}
        </p>
      ) : null}

      <div className="catalog-filters__actions">
        <button
          className="catalog-filter-button catalog-filter-button--quiet"
          onClick={clearFilters}
          type="button"
        >
          {copy.catalog.clearFilters}
        </button>
        <button className="catalog-filter-button" type="submit">
          {copy.catalog.applyFilters}
        </button>
      </div>
    </form>
  );
}

function createIgdbSuggestionProvider(): CatalogSuggestionProvider {
  return {
    async getGameSuggestions(query, signal) {
      const suggestions = await createIgdbCatalogClient().getGameSuggestions(
        query,
        signal,
      );
      return suggestions.map(toCatalogSuggestion);
    },
    async getPlatformSuggestions(query, signal) {
      const suggestions =
        await createIgdbCatalogClient().getPlatformSuggestions(query, signal);
      return suggestions.map(toCatalogSuggestion);
    },
  };
}

function toCatalogSuggestion(
  suggestion: IgdbGameSuggestion | IgdbPlatformSuggestion,
): CatalogSuggestion {
  return "igdbId" in suggestion
    ? { name: suggestion.name }
    : { id: suggestion.id, name: suggestion.name };
}

type SuggestionFieldProps = {
  id: string;
  label: string;
  suggestions: readonly CatalogSuggestion[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: CatalogSuggestion) => void;
};

function SuggestionField({
  id,
  label,
  suggestions,
  value,
  onChange,
  onSelect,
}: SuggestionFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasSuggestions = isFocused && suggestions.length > 0;

  return (
    <div className="catalog-filter-field catalog-filter-field--suggestion">
      <label htmlFor={id}>{label}</label>
      <input
        aria-autocomplete="list"
        aria-controls={`${id}-suggestions`}
        aria-expanded={hasSuggestions}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 0)}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        role="combobox"
        value={value}
        id={id}
        type="search"
      />
      {hasSuggestions ? (
        <ul
          className="catalog-filter-suggestions"
          id={`${id}-suggestions`}
          aria-label={label}
          role="listbox"
        >
          {suggestions.map((suggestion) => (
            <li
              aria-selected="false"
              key={suggestionKey(suggestion)}
              role="option"
            >
              <button
                onClick={() => {
                  onSelect(suggestion);
                  setIsFocused(false);
                }}
                type="button"
              >
                {suggestion.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function suggestionKey(suggestion: CatalogSuggestion): string {
  return `${suggestion.id === undefined ? "game" : "platform"}-${suggestion.name}`;
}

function parseYear(value: string): number | undefined {
  if (!/^\d{1,4}$/.test(value)) {
    return undefined;
  }

  const year = Number(value);
  return year >= 1 && year <= 9999 ? year : undefined;
}
