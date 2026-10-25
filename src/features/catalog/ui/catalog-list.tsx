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
  const selectedGamePosition = selectedGame
    ? items.findIndex(({ igdbId }) => igdbId === selectedGame.igdbId)
    : -1;
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
      <header className="mb-3 grid gap-1">
        <h2 className="m-0 font-display text-2xl font-semibold tracking-tight text-ink">
          {copy.catalog.rankingTitle}
        </h2>
        <p className="m-0 text-sm leading-relaxed text-ink-muted">
          {copy.catalog.rankingNote}
        </p>
      </header>
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
            <p
              className="mb-4 flex items-center gap-2 text-xs leading-[1.4] text-ink-muted"
              role="status"
            >
              <span
                aria-hidden="true"
                className="inline-block size-3.5 shrink-0 animate-[catalog-suggestion-search_700ms_linear_infinite] rounded-full border-2 border-current/30 border-t-copper motion-reduce:animate-none"
              />
              {copy.catalog.favorite.syncing}
            </p>
          ) : null}
          {authStatus === "authenticated" && favoriteIdsQuery.isError ? (
            <p
              className="mb-4 flex items-center gap-2 text-xs leading-[1.4] text-ink-muted"
              role="status"
            >
              {copy.catalog.favorite.syncError}
            </p>
          ) : null}
          <ul
            aria-label={copy.catalog.title}
            className="m-0 grid list-none grid-cols-1 gap-3 p-0 min-[768px]:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] min-[768px]:gap-5"
          >
            {items.map((game, index) => (
              <li key={game.igdbId}>
                <GameCard
                  authStatus={authStatus}
                  favoriteStatus={favoriteStatus}
                  game={game}
                  position={index + 1}
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
          position={
            selectedGamePosition >= 0 ? selectedGamePosition + 1 : undefined
          }
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
