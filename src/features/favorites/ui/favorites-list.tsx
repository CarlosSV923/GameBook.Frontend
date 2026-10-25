"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type MouseEvent } from "react";

import { useAuth } from "@/features/auth/ui/auth-provider";
import {
  CatalogFilters,
  type AppliedCatalogFilters,
  type CatalogSuggestionProvider,
} from "@/features/catalog/ui/catalog-filters";
import { GameCard } from "@/features/catalog/ui/game-card";
import { GameDetailModal } from "@/features/catalog/ui/game-detail-modal";
import { toFavoriteSnapshot } from "@/features/favorites/model/favorite-snapshot";
import { getNextFavoritePage } from "@/features/favorites/model/favorites-pagination";
import type { Favorite, FavoritePage } from "@/features/favorites/model/game";
import type { IgdbGameDetail } from "@/features/catalog/model/igdb";
import { createGameClient } from "@/features/favorites/api/game-client";
import { usePreferences } from "@/features/preferences/ui/preferences-provider";
import { collectionKeys } from "@/shared/query/query-keys";
import { CollectionPagination } from "@/shared/query/collection-pagination";
import { CollectionSentinel } from "@/shared/query/collection-sentinel";
import {
  flattenCollection,
  useInfiniteCollection,
} from "@/shared/query/use-infinite-collection";
import { CatalogState } from "@/shared/ui/catalog-state";
import { IgdbAttribution } from "@/shared/ui/igdb-attribution";

const PAGE_SIZE = 20;

export function FavoritesList() {
  const { copy } = usePreferences();
  const { getAccessToken, signOut, status: authStatus, user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AppliedCatalogFilters>({});
  const [selectedGame, setSelectedGame] = useState<Favorite | null>(null);
  const gameClient = useMemo(
    () => createGameClient({ onUnauthorized: signOut }),
    [signOut],
  );
  const suggestionProvider = useMemo<CatalogSuggestionProvider>(
    () => ({
      async getGameSuggestions(query, signal) {
        const token = getAccessToken();
        if (!token)
          throw new Error("A valid session is required to query favorites.");
        const response = await gameClient.suggestFavorites(
          token,
          "name",
          query,
          undefined,
          signal,
        );
        return response.items.map(({ value }) => ({ name: value }));
      },
      async getPlatformSuggestions(query, signal) {
        const token = getAccessToken();
        if (!token)
          throw new Error("A valid session is required to query favorites.");
        const response = await gameClient.suggestFavorites(
          token,
          "platform",
          query,
          undefined,
          signal,
        );
        return response.items.map(({ platformId, value }) => ({
          id: platformId,
          name: value,
        }));
      },
    }),
    [gameClient, getAccessToken],
  );
  const collection = useInfiniteCollection<FavoritePage, Favorite, number>({
    queryKey: collectionKeys.favorites(user?.id ?? "", filters),
    enabled: authStatus === "authenticated" && Boolean(user?.id),
    initialPageParam: 1,
    queryPage: (page: number, signal) => {
      const token = getAccessToken();
      if (!token) {
        signOut();
        throw new Error("A valid session is required to query favorites.");
      }
      return gameClient.listFavorites(
        token,
        { ...filters, page, pageSize: PAGE_SIZE },
        signal,
      );
    },
    getNextPageParam: (page) =>
      page.hasNext ? getNextFavoritePage(page) : undefined,
  });
  const items = flattenCollection<Favorite>(collection.data);
  const applyFilters = (nextFilters: AppliedCatalogFilters) => {
    if (user?.id) {
      queryClient.removeQueries({
        queryKey: ["collection", "favorites", user.id],
      });
    }
    setFilters(nextFilters);
  };
  const refetchFavorites = async () => {
    if (user?.id)
      await queryClient.resetQueries({
        queryKey: ["collection", "favorites", user.id],
      });
  };
  const refreshFavoriteIds = async () => {
    if (user?.id) {
      await queryClient.invalidateQueries({
        queryKey: ["favorite-ids", user.id],
      });
    }
  };
  const deleteMutation = useMutation({
    mutationFn: async (igdbId: number) => {
      const token = getAccessToken();
      if (!token)
        throw new Error("A valid session is required to remove favorites.");
      await gameClient.deleteFavorite(token, igdbId);
    },
    onSuccess: async (_data, igdbId) => {
      setSelectedGame((current) =>
        current?.igdbId === igdbId ? null : current,
      );
      await Promise.all([refetchFavorites(), refreshFavoriteIds()]);
    },
  });
  const snapshotMutation = useMutation({
    mutationFn: async (detail: IgdbGameDetail) => {
      const token = getAccessToken();
      if (!token)
        throw new Error("A valid session is required to query favorites.");
      return gameClient.updateFavoriteSnapshot(
        token,
        detail.igdbId,
        toFavoriteSnapshot(detail),
      );
    },
    onSuccess: async (favorite) => {
      setSelectedGame((current) =>
        current?.igdbId === favorite.igdbId ? favorite : current,
      );
      await refetchFavorites();
    },
  });

  const status = collection.isPending
    ? "loading"
    : collection.isError
      ? "error"
      : items.length
        ? "ready"
        : "empty";
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== "",
  );
  const retryNextPage = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void collection.fetchNextPage({ cancelRefetch: false });
  };

  return (
    <>
      <CatalogFilters
        onApply={applyFilters}
        suggestionProvider={suggestionProvider}
        suggestionSource={`favorites:${user?.id ?? ""}`}
      />
      {status !== "ready" ? (
        <CatalogState
          context="favorites"
          emptyMode={hasActiveFilters ? "noResults" : "initial"}
          kind={status}
          messages={copy}
          onRetry={
            status === "error" ? () => void collection.refetch() : undefined
          }
        />
      ) : (
        <>
          <ul
            aria-label={copy.favorites.title}
            className="m-0 grid list-none grid-cols-1 gap-3 p-0 min-[768px]:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] min-[768px]:gap-5"
          >
            {items.map((game, index) => (
              <li key={game.igdbId}>
                <GameCard
                  authStatus="authenticated"
                  game={game}
                  position={index + 1}
                  messages={copy}
                  onDelete={(id) => deleteMutation.mutateAsync(id)}
                  onSelect={() => setSelectedGame(game)}
                />
              </li>
            ))}
          </ul>
          <CollectionSentinel
            enabled={
              Boolean(collection.hasNextPage) && !collection.isFetchingNextPage
            }
            onIntersect={() =>
              void collection.fetchNextPage({ cancelRefetch: false })
            }
          />
          <CollectionPagination
            fetching={collection.isFetchingNextPage}
            hasNext={Boolean(collection.hasNextPage)}
            error={collection.isFetchNextPageError}
            messages={copy}
            onNext={retryNextPage}
          />
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
          onDelete={(id) => deleteMutation.mutateAsync(id)}
          onDetailLoaded={async (detail) => {
            await snapshotMutation.mutateAsync(detail);
          }}
        />
      ) : null}
    </>
  );
}
