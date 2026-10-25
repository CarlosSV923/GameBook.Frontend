"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { createIgdbCatalogClient } from "@/features/catalog/api/igdb-catalog-client";
import { usePreferences } from "@/features/preferences/ui/preferences-provider";
import type {
  IgdbGameSuggestion,
  IgdbPlatformSuggestion,
} from "@/features/catalog/model/igdb";
import { suggestionKey as suggestionQueryKey } from "@/shared/query/query-keys";

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
  suggestionSource?: string;
};

export function CatalogFilters({
  eyebrow,
  heading,
  onApply,
  suggestionProvider,
  suggestionSource = "catalog",
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
  const [debouncedName, setDebouncedName] = useState("");
  const [selectedGameName, setSelectedGameName] = useState("");
  const [debouncedPlatform, setDebouncedPlatform] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    const query = name.trim();
    if (query.length < 2) {
      return;
    }
    const timeout = window.setTimeout(() => setDebouncedName(query), 250);
    return () => window.clearTimeout(timeout);
  }, [name]);
  useEffect(() => {
    const query = platformQuery.trim();
    if (query.length < 2) {
      return;
    }
    const timeout = window.setTimeout(() => setDebouncedPlatform(query), 250);
    return () => window.clearTimeout(timeout);
  }, [platformQuery]);

  const gameSuggestionQuery = useQuery({
    queryKey: suggestionQueryKey(suggestionSource, "game", name.trim()),
    enabled: name.trim().length >= 2 && debouncedName === name.trim(),
    queryFn: ({ signal }) =>
      resolvedSuggestionProvider.getGameSuggestions(name.trim(), signal),
  });
  const platformSuggestionQuery = useQuery({
    queryKey: suggestionQueryKey(
      suggestionSource,
      "platform",
      platformQuery.trim(),
    ),
    enabled:
      platformQuery.trim().length >= 2 &&
      debouncedPlatform === platformQuery.trim(),
    queryFn: ({ signal }) =>
      resolvedSuggestionProvider.getPlatformSuggestions(
        platformQuery.trim(),
        signal,
      ),
  });
  const gameSuggestions = gameSuggestionQuery.data ?? [];
  const platformSuggestions = platformSuggestionQuery.data ?? [];
  const isLoadingGameSuggestions =
    name.trim().length >= 2 &&
    (debouncedName !== name.trim() || gameSuggestionQuery.isFetching);
  const isLoadingPlatformSuggestions =
    platformQuery.trim().length >= 2 &&
    (debouncedPlatform !== platformQuery.trim() ||
      platformSuggestionQuery.isFetching);

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
            selectedGameName !== name.trim() && debouncedName === name.trim()
              ? gameSuggestions
              : []
          }
          isLoading={isLoadingGameSuggestions}
          loadingLabel={copy.catalog.searchingSuggestions}
          value={name}
          onChange={(value) => {
            setName(value);
            setSelectedGameName("");
          }}
          onSelect={(suggestion) => {
            setName(suggestion.name);
            setSelectedGameName(suggestion.name);
          }}
        />
        <SuggestionField
          id="catalog-platform"
          label={copy.catalog.platform}
          suggestions={
            platformId === undefined &&
            debouncedPlatform === platformQuery.trim()
              ? platformSuggestions
              : []
          }
          isLoading={isLoadingPlatformSuggestions}
          loadingLabel={copy.catalog.searchingSuggestions}
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
  isLoading: boolean;
  label: string;
  loadingLabel: string;
  suggestions: readonly CatalogSuggestion[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: CatalogSuggestion) => void;
};

function SuggestionField({
  id,
  isLoading,
  label,
  loadingLabel,
  suggestions,
  value,
  onChange,
  onSelect,
}: SuggestionFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasSuggestions = isFocused && suggestions.length > 0;
  const isOpen = hasSuggestions || (isFocused && isLoading);

  return (
    <div
      className="catalog-filter-field catalog-filter-field--suggestion"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (
          nextTarget !== null &&
          event.currentTarget.contains(nextTarget as Node)
        ) {
          return;
        }

        setIsFocused(false);
      }}
      onFocus={() => setIsFocused(true)}
    >
      <label htmlFor={id}>{label}</label>
      <input
        aria-autocomplete="list"
        aria-busy={isLoading}
        aria-controls={`${id}-suggestions`}
        aria-expanded={isOpen}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        role="combobox"
        value={value}
        id={id}
        type="search"
      />
      {isOpen && isLoading ? (
        <div
          aria-live="polite"
          className="catalog-filter-suggestions catalog-filter-suggestions--loading"
          id={`${id}-suggestions`}
          role="status"
        >
          <span
            aria-hidden="true"
            className="catalog-filter-suggestions__spinner"
          />
          <span>{loadingLabel}</span>
        </div>
      ) : hasSuggestions ? (
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
                onMouseDown={(event) => {
                  event.preventDefault();
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
