"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { createIgdbCatalogClient } from "@/features/api/igdb-catalog-client";
import {
  getNextCatalogOffset,
  mergeCatalogItems,
} from "@/features/catalog/catalog-pagination";
import {
  CatalogFilters,
  type AppliedCatalogFilters,
} from "@/features/catalog/catalog-filters";
import { GameDetailModal } from "@/features/catalog/game-detail-modal";
import { GameCard } from "@/features/catalog/game-card";
import { usePreferences } from "@/features/preferences/preferences-provider";
import type { IgdbGameCard } from "@/shared/api/igdb";
import { CatalogState, type CatalogStateKind } from "@/shared/ui/catalog-state";
import { IgdbAttribution } from "@/shared/ui/igdb-attribution";

type CatalogStatus = CatalogStateKind | "ready";
const CATALOG_PAGE_SIZE = 20;

export function CatalogList() {
  const { copy } = usePreferences();
  const [items, setItems] = useState<IgdbGameCard[]>([]);
  const [status, setStatus] = useState<CatalogStatus>("loading");
  const [filters, setFilters] = useState<AppliedCatalogFilters>({});
  const [hasNext, setHasNext] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [paginationError, setPaginationError] = useState(false);
  const [selectedGame, setSelectedGame] = useState<IgdbGameCard | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const activeControllerRef = useRef<AbortController | null>(null);
  const requestVersionRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const requestVersion = ++requestVersionRef.current;
    let isActive = true;
    activeControllerRef.current = controller;

    void createIgdbCatalogClient()
      .listCatalog(
        { ...filters, limit: CATALOG_PAGE_SIZE, offset: 0 },
        controller.signal,
      )
      .then((page) => {
        if (!isActive || requestVersion !== requestVersionRef.current) {
          return;
        }

        setItems(page.items);
        setHasNext(page.hasNext);
        setNextOffset(getNextCatalogOffset(page));
        setPaginationError(false);
        setStatus(page.items.length > 0 ? "ready" : "empty");
      })
      .catch(() => {
        if (
          isActive &&
          !controller.signal.aborted &&
          requestVersion === requestVersionRef.current
        ) {
          setHasNext(false);
          setStatus("error");
        }
      });

    return () => {
      isActive = false;
      controller.abort();
      if (activeControllerRef.current === controller) {
        activeControllerRef.current = null;
      }
    };
  }, [filters, retryKey]);

  const loadNextPage = useCallback(async () => {
    if (status !== "ready" || !hasNext || isLoadingMore) {
      return;
    }

    const controller = new AbortController();
    const requestVersion = ++requestVersionRef.current;
    activeControllerRef.current?.abort();
    activeControllerRef.current = controller;
    setIsLoadingMore(true);
    setPaginationError(false);

    try {
      const page = await createIgdbCatalogClient().listCatalog(
        { ...filters, limit: CATALOG_PAGE_SIZE, offset: nextOffset },
        controller.signal,
      );

      if (
        controller.signal.aborted ||
        requestVersion !== requestVersionRef.current
      ) {
        return;
      }

      setItems((currentItems) => mergeCatalogItems(currentItems, page.items));
      setHasNext(page.hasNext);
      setNextOffset(getNextCatalogOffset(page));
    } catch {
      if (
        !controller.signal.aborted &&
        requestVersion === requestVersionRef.current
      ) {
        setPaginationError(true);
      }
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setIsLoadingMore(false);
        activeControllerRef.current = null;
      }
    }
  }, [filters, hasNext, isLoadingMore, nextOffset, status]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (
      !sentinel ||
      typeof IntersectionObserver === "undefined" ||
      status !== "ready" ||
      !hasNext
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void loadNextPage();
        }
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasNext, loadNextPage, status]);

  const applyFilters = (nextFilters: AppliedCatalogFilters) => {
    activeControllerRef.current?.abort();
    requestVersionRef.current += 1;
    setItems([]);
    setHasNext(false);
    setNextOffset(0);
    setIsLoadingMore(false);
    setPaginationError(false);
    setStatus("loading");
    setFilters(nextFilters);
  };

  const retryCatalog = () => {
    activeControllerRef.current?.abort();
    requestVersionRef.current += 1;
    setItems([]);
    setHasNext(false);
    setNextOffset(0);
    setPaginationError(false);
    setStatus("loading");
    setRetryKey((key) => key + 1);
  };

  const retryNextPage = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void loadNextPage();
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
        <>
          <ul aria-label={copy.catalog.title} className="catalog-grid">
            {items.map((game) => (
              <li key={game.igdbId}>
                <GameCard
                  game={game}
                  messages={copy}
                  onSelect={() => setSelectedGame(game)}
                />
              </li>
            ))}
          </ul>
          <div
            aria-hidden="true"
            className="catalog-pagination__sentinel"
            ref={sentinelRef}
          />
          <div aria-live="polite" className="catalog-pagination">
            {isLoadingMore ? (
              <p className="catalog-pagination__status" role="status">
                {copy.states.loadingMore}
              </p>
            ) : null}
            {paginationError ? (
              <div className="catalog-pagination__error" role="alert">
                <p>{copy.states.paginationError}</p>
                <button
                  className="catalog-filter-button catalog-filter-button--quiet"
                  onClick={retryNextPage}
                  type="button"
                >
                  {copy.states.retry}
                </button>
              </div>
            ) : null}
            {!isLoadingMore && !paginationError && hasNext ? (
              <button
                className="catalog-filter-button catalog-pagination__button"
                onClick={retryNextPage}
                type="button"
              >
                {copy.states.loadMore}
              </button>
            ) : null}
            {!isLoadingMore && !paginationError && !hasNext ? (
              <p className="catalog-pagination__status">
                {copy.states.endOfResults}
              </p>
            ) : null}
          </div>
        </>
      )}
      <IgdbAttribution messages={copy} />
      {selectedGame ? (
        <GameDetailModal
          game={selectedGame}
          messages={copy}
          onClose={() => setSelectedGame(null)}
        />
      ) : null}
    </>
  );
}
