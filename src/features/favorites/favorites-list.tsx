"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { createGameClient } from "@/features/api/game-client";
import { useAuth } from "@/features/auth/auth-provider";
import {
  CatalogFilters,
  type AppliedCatalogFilters,
  type CatalogSuggestionProvider,
} from "@/features/catalog/catalog-filters";
import { mergeCatalogItems } from "@/features/catalog/catalog-pagination";
import { GameDetailModal } from "@/features/catalog/game-detail-modal";
import { GameCard } from "@/features/catalog/game-card";
import { toFavoriteSnapshot } from "@/features/favorites/favorite-snapshot";
import { getNextFavoritePage } from "@/features/favorites/favorites-pagination";
import { usePreferences } from "@/features/preferences/preferences-provider";
import type { Favorite } from "@/shared/api/game";
import type { IgdbGameDetail } from "@/shared/api/igdb";
import { CatalogState, type CatalogStateKind } from "@/shared/ui/catalog-state";
import { IgdbAttribution } from "@/shared/ui/igdb-attribution";

type FavoritesStatus = CatalogStateKind | "ready";
const FAVORITES_PAGE_SIZE = 20;

export function FavoritesList() {
  const { copy } = usePreferences();
  const { getAccessToken, signOut, status: authStatus } = useAuth();
  const gameClient = useMemo(
    () => createGameClient({ onUnauthorized: signOut }),
    [signOut],
  );
  const [items, setItems] = useState<Favorite[]>([]);
  const [status, setStatus] = useState<FavoritesStatus>("loading");
  const [filters, setFilters] = useState<AppliedCatalogFilters>({});
  const [hasNext, setHasNext] = useState(false);
  const [nextPage, setNextPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [paginationError, setPaginationError] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Favorite | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const activeControllerRef = useRef<AbortController | null>(null);
  const requestVersionRef = useRef(0);

  const suggestionProvider = useMemo<CatalogSuggestionProvider>(
    () => ({
      async getGameSuggestions(query, signal) {
        const token = requireAccessToken(getAccessToken);
        const response = await gameClient.suggestFavorites(
          token,
          "name",
          query,
          undefined,
          signal,
        );
        return response.items.map((suggestion) => ({
          name: suggestion.value,
        }));
      },
      async getPlatformSuggestions(query, signal) {
        const token = requireAccessToken(getAccessToken);
        const response = await gameClient.suggestFavorites(
          token,
          "platform",
          query,
          undefined,
          signal,
        );
        return response.items.map((suggestion) => ({
          id: suggestion.platformId,
          name: suggestion.value,
        }));
      },
    }),
    [gameClient, getAccessToken],
  );

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      signOut();
      return;
    }

    const controller = new AbortController();
    const requestVersion = ++requestVersionRef.current;
    let isActive = true;
    activeControllerRef.current = controller;

    void gameClient
      .listFavorites(
        token,
        { ...filters, page: 1, pageSize: FAVORITES_PAGE_SIZE },
        controller.signal,
      )
      .then((page) => {
        if (!isActive || requestVersion !== requestVersionRef.current) {
          return;
        }

        setItems(page.items);
        setHasNext(page.hasNext);
        setNextPage(getNextFavoritePage(page));
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
  }, [authStatus, filters, getAccessToken, gameClient, retryKey, signOut]);

  const loadNextPage = useCallback(async () => {
    if (status !== "ready" || !hasNext || isLoadingMore) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      signOut();
      return;
    }

    const controller = new AbortController();
    const requestVersion = ++requestVersionRef.current;
    activeControllerRef.current?.abort();
    activeControllerRef.current = controller;
    setIsLoadingMore(true);
    setPaginationError(false);

    try {
      const page = await gameClient.listFavorites(
        token,
        { ...filters, page: nextPage, pageSize: FAVORITES_PAGE_SIZE },
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
      setNextPage(getNextFavoritePage(page));
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
  }, [
    filters,
    gameClient,
    getAccessToken,
    hasNext,
    isLoadingMore,
    nextPage,
    signOut,
    status,
  ]);

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
    setNextPage(1);
    setIsLoadingMore(false);
    setPaginationError(false);
    setStatus("loading");
    setFilters(nextFilters);
  };

  const retryFavorites = () => {
    activeControllerRef.current?.abort();
    requestVersionRef.current += 1;
    setItems([]);
    setHasNext(false);
    setNextPage(1);
    setPaginationError(false);
    setStatus("loading");
    setRetryKey((key) => key + 1);
  };

  const retryNextPage = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void loadNextPage();
  };

  const deleteFavorite = useCallback(
    async (igdbId: number) => {
      const token = requireAccessToken(getAccessToken);
      await gameClient.deleteFavorite(token, igdbId);
      setItems((currentItems) =>
        currentItems.filter((item) => item.igdbId !== igdbId),
      );
      if (items.length === 1 && !hasNext) {
        setStatus("empty");
      }
      setSelectedGame((currentGame) =>
        currentGame?.igdbId === igdbId ? null : currentGame,
      );
    },
    [gameClient, getAccessToken, hasNext, items.length],
  );

  const syncFavoriteSnapshot = useCallback(
    async (detail: IgdbGameDetail) => {
      const token = requireAccessToken(getAccessToken);
      const updatedFavorite = await gameClient.updateFavoriteSnapshot(
        token,
        detail.igdbId,
        toFavoriteSnapshot(detail),
      );

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.igdbId === updatedFavorite.igdbId ? updatedFavorite : item,
        ),
      );
      setSelectedGame((currentGame) =>
        currentGame?.igdbId === updatedFavorite.igdbId
          ? updatedFavorite
          : currentGame,
      );
    },
    [gameClient, getAccessToken],
  );

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== "",
  );

  return (
    <>
      <CatalogFilters
        eyebrow={copy.favorites.eyebrow}
        onApply={applyFilters}
        suggestionProvider={suggestionProvider}
      />
      {status !== "ready" ? (
        <CatalogState
          context="favorites"
          emptyMode={hasActiveFilters ? "noResults" : "initial"}
          kind={status}
          messages={copy}
          onRetry={status === "error" ? retryFavorites : undefined}
        />
      ) : (
        <>
          <ul aria-label={copy.favorites.title} className="catalog-grid">
            {items.map((game) => (
              <li key={game.igdbId}>
                <GameCard
                  authStatus="authenticated"
                  game={game}
                  messages={copy}
                  onDelete={deleteFavorite}
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
                <span aria-hidden="true" className="loading-spinner" />
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
          authStatus="authenticated"
          game={selectedGame}
          key={selectedGame.igdbId}
          messages={copy}
          onClose={() => setSelectedGame(null)}
          onDelete={deleteFavorite}
          onDetailLoaded={syncFavoriteSnapshot}
        />
      ) : null}
    </>
  );
}

function requireAccessToken(getAccessToken: () => string | null): string {
  const token = getAccessToken();
  if (!token) {
    throw new Error("A valid session is required to query favorites.");
  }

  return token;
}
