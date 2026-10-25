"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type MouseEvent } from "react";

import { useAuth } from "@/features/auth/ui/auth-provider";
import { createIgdbCatalogClient } from "@/features/catalog/api/igdb-catalog-client";
import { listAllFavoriteIds } from "@/features/catalog/model/catalog-favorites";
import { getNextCatalogOffset } from "@/features/catalog/model/catalog-pagination";
import type { AppliedCatalogFilters } from "@/features/catalog/ui/catalog-filters";
import { CatalogFilters } from "@/features/catalog/ui/catalog-filters";
import { GameCard } from "@/features/catalog/ui/game-card";
import { GameDetailModal } from "@/features/catalog/ui/game-detail-modal";
import type { FavoriteCreateInput } from "@/features/favorites/model/game";
import { createGameClient } from "@/features/favorites/api/game-client";
import type {
  IgdbCatalogPage,
  IgdbGameCard,
} from "@/features/catalog/model/igdb";
import { usePreferences } from "@/features/preferences/ui/preferences-provider";
import { favoriteIdsKey, collectionKeys } from "@/shared/query/query-keys";
import { CollectionPagination } from "@/shared/query/collection-pagination";
import { CollectionSentinel } from "@/shared/query/collection-sentinel";
import {
  flattenCollection,
  useInfiniteCollection,
} from "@/shared/query/use-infinite-collection";
import { CatalogState } from "@/shared/ui/catalog-state";
import { IgdbAttribution } from "@/shared/ui/igdb-attribution";

const PAGE_SIZE = 20;

export function CatalogList() {
  const { copy } = usePreferences();
  const { getAccessToken, signOut, status: authStatus, user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AppliedCatalogFilters>({});
  const [selectedGame, setSelectedGame] = useState<IgdbGameCard | null>(null);
  const gameClient = useMemo(
    () => createGameClient({ onUnauthorized: signOut }),
    [signOut],
  );
  const catalogClient = useMemo(() => createIgdbCatalogClient(), []);
  const catalog = useInfiniteCollection<IgdbCatalogPage, IgdbGameCard, number>({
    queryKey: collectionKeys.catalog(filters),
    initialPageParam: 0,
    queryPage: (offset: number, signal) =>
      catalogClient.listCatalog(
        { ...filters, limit: PAGE_SIZE, offset },
        signal,
      ),
    getNextPageParam: (page) =>
      page.hasNext ? getNextCatalogOffset(page) : undefined,
    // Keeps the server-prefetched first page fresh on hydration.
    staleTime: 60_000,
  });
  const items = flattenCollection<IgdbGameCard>(catalog.data);
  const favoriteIdsQuery = useQuery({
    queryKey: favoriteIdsKey(user?.id ?? ""),
    enabled: authStatus === "authenticated" && Boolean(user?.id),
    queryFn: ({ signal }) => {
      const token = getAccessToken();
      if (!token) {
        signOut();
        throw new Error("A valid session is required to query favorites.");
      }
      return listAllFavoriteIds(gameClient, token, signal);
    },
  });
  const favoriteIds = favoriteIdsQuery.data ?? new Set<number>();
  // A disabled query (anonymous visitor) is also `pending`; only a signed-in
  // user waits for their favorite IDs.
  const favoriteStatus =
    authStatus === "authenticated" && favoriteIdsQuery.isPending
      ? "loading"
      : "ready";
  const applyFilters = (nextFilters: AppliedCatalogFilters) => {
    queryClient.removeQueries({ queryKey: ["collection", "catalog"] });
    setFilters(nextFilters);
  };

  const invalidateFavorites = async () => {
    const userId = user?.id;
    if (!userId) return;
    await queryClient.resetQueries({
      queryKey: ["collection", "favorites", userId],
    });
    await queryClient.invalidateQueries({ queryKey: favoriteIdsKey(userId) });
  };
  const saveMutation = useMutation({
    mutationFn: async (game: FavoriteCreateInput) => {
      const token = getAccessToken();
      if (!token)
        throw new Error("A valid session is required to save favorites.");
      await gameClient.createFavorite(token, game);
    },
    onSuccess: invalidateFavorites,
  });
  const deleteMutation = useMutation({
    mutationFn: async (igdbId: number) => {
      const token = getAccessToken();
      if (!token)
        throw new Error("A valid session is required to remove favorites.");
      await gameClient.deleteFavorite(token, igdbId);
    },
    onSuccess: invalidateFavorites,
  });

  const status = catalog.isPending
    ? "loading"
    : catalog.isError
      ? "error"
      : items.length
        ? "ready"
        : "empty";
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== "",
  );
  const retryNextPage = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void catalog.fetchNextPage({ cancelRefetch: false });
  };

  return (
    <>
      <p className="catalog-ranking-note">{copy.catalog.rankingNote}</p>
      <CatalogFilters onApply={applyFilters} />
      {status !== "ready" ? (
        <CatalogState
          emptyMode={hasActiveFilters ? "noResults" : "initial"}
          kind={status}
          messages={copy}
          onRetry={
            status === "error" ? () => void catalog.refetch() : undefined
          }
        />
      ) : (
        <>
          {authStatus === "authenticated" && favoriteIdsQuery.isPending ? (
            <p className="catalog-favorites-status" role="status">
              <span aria-hidden="true" className="loading-spinner" />
              {copy.catalog.favorite.syncing}
            </p>
          ) : null}
          {authStatus === "authenticated" && favoriteIdsQuery.isError ? (
            <p className="catalog-favorites-status" role="status">
              {copy.catalog.favorite.syncError}
            </p>
          ) : null}
          <ul aria-label={copy.catalog.title} className="catalog-grid">
            {items.map((game) => (
              <li key={game.igdbId}>
                <GameCard
                  authStatus={authStatus}
                  favoriteStatus={favoriteStatus}
                  game={game}
                  isFavorite={favoriteIds.has(game.igdbId)}
                  messages={copy}
                  onDelete={(id) => deleteMutation.mutateAsync(id)}
                  onSave={(input) => saveMutation.mutateAsync(input)}
                  onSelect={() => setSelectedGame(game)}
                />
              </li>
            ))}
          </ul>
          <CollectionSentinel
            enabled={
              Boolean(catalog.hasNextPage) && !catalog.isFetchingNextPage
            }
            onIntersect={() =>
              void catalog.fetchNextPage({ cancelRefetch: false })
            }
          />
          <CollectionPagination
            fetching={catalog.isFetchingNextPage}
            hasNext={Boolean(catalog.hasNextPage)}
            error={catalog.isFetchNextPageError}
            messages={copy}
            onNext={retryNextPage}
          />
        </>
      )}
      <IgdbAttribution messages={copy} />
      {selectedGame ? (
        <GameDetailModal
          authStatus={authStatus}
          favoriteStatus={favoriteStatus}
          game={selectedGame}
          isFavorite={favoriteIds.has(selectedGame.igdbId)}
          messages={copy}
          onDelete={(id) => deleteMutation.mutateAsync(id)}
          onSave={(input) => saveMutation.mutateAsync(input)}
          onClose={() => setSelectedGame(null)}
        />
      ) : null}
    </>
  );
}
