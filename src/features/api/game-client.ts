import {
  requireBearerToken,
  requestJson,
  resolveBaseUrl,
  type Fetcher,
} from "@/shared/api/http";
import type {
  Favorite,
  FavoriteCreateInput,
  FavoriteFilters,
  FavoritePage,
  FavoriteSnapshotUpdate,
  GameClient,
  SuggestionPage,
  SuggestionType,
} from "@/shared/api/game";

type GameClientOptions = {
  baseUrl?: string;
  fetcher?: Fetcher;
};

const jsonHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export function createGameClient(options: GameClientOptions = {}): GameClient {
  const fetcher = options.fetcher ?? fetch;
  const baseUrl = () =>
    resolveBaseUrl(
      options.baseUrl ?? process.env.NEXT_PUBLIC_GAME_URL,
      "NEXT_PUBLIC_GAME_URL",
    );

  const authenticatedHeaders = (token: string) => ({
    ...jsonHeaders,
    Authorization: requireBearerToken(token),
  });

  return {
    createFavorite(token: string, input: FavoriteCreateInput) {
      return requestJson<Favorite>(fetcher, `${baseUrl()}/v1/favorites`, {
        body: JSON.stringify(input),
        headers: authenticatedHeaders(token),
        method: "POST",
      });
    },

    async deleteFavorite(token: string, igdbId: number) {
      await requestJson<null>(fetcher, `${baseUrl()}/v1/favorites/${igdbId}`, {
        headers: authenticatedHeaders(token),
        method: "DELETE",
      });
    },

    listFavorites(token: string, filters: FavoriteFilters = {}) {
      const query = new URLSearchParams();

      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== "") {
          query.set(key, String(value));
        }
      }

      const queryString = query.toString();
      const url = `${baseUrl()}/v1/favorites${queryString ? `?${queryString}` : ""}`;

      return requestJson<FavoritePage>(fetcher, url, {
        headers: authenticatedHeaders(token),
        method: "GET",
      });
    },

    suggestFavorites(
      token: string,
      type: SuggestionType,
      query: string,
      limit?: number,
    ) {
      const params = new URLSearchParams({ q: query, type });

      if (limit !== undefined) {
        params.set("limit", String(limit));
      }

      return requestJson<SuggestionPage>(
        fetcher,
        `${baseUrl()}/v1/favorites/suggestions?${params.toString()}`,
        {
          headers: authenticatedHeaders(token),
          method: "GET",
        },
      );
    },

    updateFavoriteSnapshot(
      token: string,
      igdbId: number,
      input: FavoriteSnapshotUpdate,
    ) {
      return requestJson<Favorite>(
        fetcher,
        `${baseUrl()}/v1/favorites/${igdbId}/snapshot`,
        {
          body: JSON.stringify(input),
          headers: authenticatedHeaders(token),
          method: "PATCH",
        },
      );
    },
  };
}
