"use client";

import { useEffect, useState } from "react";

import { createIgdbCatalogClient } from "@/features/api/igdb-catalog-client";
import {
  CatalogFilters,
  type AppliedCatalogFilters,
} from "@/features/catalog/catalog-filters";
import { GameCard } from "@/features/catalog/game-card";
import { usePreferences } from "@/features/preferences/preferences-provider";
import type { IgdbGameCard } from "@/shared/api/igdb";
import { CatalogState, type CatalogStateKind } from "@/shared/ui/catalog-state";

type CatalogStatus = CatalogStateKind | "ready";

export function CatalogList() {
  const { copy } = usePreferences();
  const [items, setItems] = useState<IgdbGameCard[]>([]);
  const [status, setStatus] = useState<CatalogStatus>("loading");
  const [filters, setFilters] = useState<AppliedCatalogFilters>({});
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    void createIgdbCatalogClient()
      .listCatalog(filters, controller.signal)
      .then((page) => {
        if (!isActive) {
          return;
        }

        setItems(page.items);
        setStatus(page.items.length > 0 ? "ready" : "empty");
      })
      .catch(() => {
        if (isActive && !controller.signal.aborted) {
          setStatus("error");
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [filters, retryKey]);

  const applyFilters = (nextFilters: AppliedCatalogFilters) => {
    setItems([]);
    setStatus("loading");
    setFilters(nextFilters);
  };

  const retryCatalog = () => {
    setItems([]);
    setStatus("loading");
    setRetryKey((key) => key + 1);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== "",
  );

  return (
    <>
      <CatalogFilters onApply={applyFilters} />
      {status !== "ready" ? (
        <CatalogState
          emptyMode={hasActiveFilters ? "noResults" : "initial"}
          kind={status}
          messages={copy}
          onRetry={status === "error" ? retryCatalog : undefined}
        />
      ) : (
        <ul aria-label={copy.catalog.title} className="catalog-grid">
          {items.map((game) => (
            <li key={game.igdbId}>
              <GameCard game={game} messages={copy} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
