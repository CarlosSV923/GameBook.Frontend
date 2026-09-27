import {
  requireBearerToken,
  requestJson,
  resolveBaseUrl,
  defaultHttpClient,
  type HttpClient,
  type RequestJsonOptions,
} from "@/shared/api/http";
import { waitForServiceHealth } from "@/shared/api/healthcheck";
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
  httpClient?: HttpClient;
  onUnauthorized?: RequestJsonOptions["onUnauthorized"];
};

const jsonHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export function createGameClient(options: GameClientOptions = {}): GameClient {
  const httpClient = options.httpClient ?? defaultHttpClient;
  const baseUrl = () =>
    resolveBaseUrl(
      options.baseUrl ?? process.env.NEXT_PUBLIC_GAME_URL,
      "NEXT_PUBLIC_GAME_URL",
    );

  const authenticatedHeaders = (token: string) => ({
    ...jsonHeaders,
    Authorization: requireBearerToken(token),
  });
  const requestOptions = { ...options, retry: false };

  return {
    async createFavorite(token: string, input: FavoriteCreateInput) {
      const serviceUrl = baseUrl();
      await waitForServiceHealth(serviceUrl, undefined, httpClient);
      return requestJson<Favorite>(
        httpClient,
        `${serviceUrl}/v1/favorites`,
        {
          data: input,
          headers: authenticatedHeaders(token),
          method: "POST",
        },
        requestOptions,
      );
    },

    async deleteFavorite(token: string, igdbId: number) {
      const serviceUrl = baseUrl();
      await waitForServiceHealth(serviceUrl, undefined, httpClient);
      await requestJson<null>(
        httpClient,
        `${serviceUrl}/v1/favorites/${igdbId}`,
        {
          headers: authenticatedHeaders(token),
          method: "DELETE",
        },
        requestOptions,
      );
    },

    async listFavorites(
      token: string,
      filters: FavoriteFilters = {},
      signal?: AbortSignal,
    ) {
      const query = new URLSearchParams();

      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== "") {
          query.set(key, String(value));
        }
      }

      const serviceUrl = baseUrl();
      await waitForServiceHealth(serviceUrl, signal, httpClient);
      const queryString = query.toString();

      return requestJson<FavoritePage>(
        httpClient,
        `${serviceUrl}/v1/favorites${queryString ? `?${queryString}` : ""}`,
        {
          headers: authenticatedHeaders(token),
          method: "GET",
          signal,
        },
        requestOptions,
      );
    },

    async suggestFavorites(
      token: string,
      type: SuggestionType,
      query: string,
      limit?: number,
      signal?: AbortSignal,
    ) {
      const params = new URLSearchParams({ q: query, type });

      if (limit !== undefined) {
        params.set("limit", String(limit));
      }

      const serviceUrl = baseUrl();
      await waitForServiceHealth(serviceUrl, signal, httpClient);

      return requestJson<SuggestionPage>(
        httpClient,
        `${serviceUrl}/v1/favorites/suggestions?${params.toString()}`,
        {
          headers: authenticatedHeaders(token),
          method: "GET",
          signal,
        },
        requestOptions,
      );
    },

    async updateFavoriteSnapshot(
      token: string,
      igdbId: number,
      input: FavoriteSnapshotUpdate,
    ) {
      const serviceUrl = baseUrl();
      await waitForServiceHealth(serviceUrl, undefined, httpClient);
      return requestJson<Favorite>(
        httpClient,
        `${serviceUrl}/v1/favorites/${igdbId}/snapshot`,
        {
          data: input,
          headers: authenticatedHeaders(token),
          method: "PATCH",
        },
        requestOptions,
      );
    },
  };
}
