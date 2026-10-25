"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { createIgdbCatalogClient } from "@/features/catalog/api/igdb-catalog-client";
import { usePreferences } from "@/features/preferences/ui/preferences-provider";
import type {
  IgdbGameSuggestion,
  IgdbPlatformSuggestion,
} from "@/features/catalog/model/igdb";
import { suggestionKey as suggestionQueryKey } from "@/shared/query/query-keys";
import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";
import { TextField } from "@/shared/ui/text-field";

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
  suggestionSource?: string;
};

export function CatalogFilters({
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
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const advancedPanelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (advancedOpen) {
      advancedPanelRef.current
        ?.querySelector<HTMLElement>("input, button")
        ?.focus();
    }
  }, [advancedOpen]);

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
    closeMobilePanel();
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
    closeMobilePanel();
    onApply({});
  };

  const closeMobilePanel = () => {
    setAdvancedOpen(false);
    if (window.matchMedia("(max-width: 767px)").matches) {
      requestAnimationFrame(() =>
        document.getElementById("catalog-filter-toggle")?.focus(),
      );
    }
  };

  return (
    <form
      className="sticky top-[70px] z-20 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 rounded-panel border border-border-soft bg-paper-raised p-3 shadow-raised md:top-[74px] md:grid-cols-[minmax(220px,1.3fr)_minmax(180px,1.1fr)_minmax(112px,.6fr)_minmax(112px,.6fr)_auto] md:gap-3 md:p-4"
      onSubmit={applyFilters}
    >
      <div className="min-w-0">
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
          searchIcon
        />
      </div>
      <Button
        aria-controls="catalog-advanced-filters"
        aria-expanded={advancedOpen}
        className="md:hidden"
        id="catalog-filter-toggle"
        onClick={() => setAdvancedOpen((open) => !open)}
        variant="secondary"
      >
        {copy.catalog.filters}
      </Button>
      <div
        aria-label={heading ?? copy.catalog.filters}
        className={
          advancedOpen
            ? "col-span-2 grid grid-cols-2 gap-3 md:contents"
            : "hidden md:contents"
        }
        id="catalog-advanced-filters"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeMobilePanel();
          }
        }}
        ref={advancedPanelRef}
        role="region"
      >
        <div className="col-span-2 flex items-center justify-between md:hidden">
          <span className="font-ui text-sm font-semibold text-ink">
            {heading ?? copy.catalog.filters}
          </span>
          <IconButton
            aria-label={copy.catalog.closeFilters}
            onClick={() => {
              closeMobilePanel();
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
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
        <TextField
          className="font-data"
          id="catalog-year-from"
          label={copy.catalog.yearFrom}
          inputMode="numeric"
          max="9999"
          min="1"
          onChange={(event) => setYearFrom(event.target.value)}
          placeholder="YYYY"
          type="number"
          value={yearFrom}
        />
        <TextField
          className="font-data"
          id="catalog-year-to"
          label={copy.catalog.yearTo}
          inputMode="numeric"
          max="9999"
          min="1"
          onChange={(event) => setYearTo(event.target.value)}
          placeholder="YYYY"
          type="number"
          value={yearTo}
        />

        {validationMessage ? (
          <p
            className="col-span-2 m-0 text-sm text-danger md:col-span-5"
            role="alert"
          >
            {validationMessage}
          </p>
        ) : null}

        <div className="col-span-2 flex flex-col-reverse gap-2 md:col-span-1 md:flex-row">
          <Button
            className="w-full md:w-auto"
            onClick={clearFilters}
            variant="ghost"
          >
            {copy.catalog.clearFilters}
          </Button>
          <Button className="w-full md:w-auto" type="submit" variant="primary">
            {copy.catalog.applyFilters}
          </Button>
        </div>
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
  searchIcon?: boolean;
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
  searchIcon = false,
}: SuggestionFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasSuggestions = isFocused && suggestions.length > 0;
  const isOpen = hasSuggestions || (isFocused && isLoading);

  return (
    <div
      className="relative grid min-w-0 gap-2 font-ui text-sm"
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
      <TextField
        aria-autocomplete="list"
        aria-busy={isLoading}
        aria-controls={`${id}-suggestions`}
        aria-expanded={isOpen}
        autoComplete="off"
        className="pr-3"
        icon={searchIcon ? <SearchIcon /> : undefined}
        id={id}
        label={label}
        onChange={(event) => onChange(event.target.value)}
        role="combobox"
        value={value}
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

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[18px] text-ink-muted"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        cx="10.8"
        cy="10.8"
        r="6.8"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m16 16 4.5 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
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
