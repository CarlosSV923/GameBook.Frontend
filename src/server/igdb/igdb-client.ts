import "server-only";

import type { AxiosResponse } from "axios";

import {
  defaultHttpClient,
  requestRaw,
  type HttpClient,
} from "@/shared/api/http";
import {
  IgdbClientError,
  type ApplicationTokenProvider,
  type IgdbCatalogFilters,
  type IgdbCatalogPage,
  type IgdbClient,
} from "@/shared/api/igdb";
import {
  getIgdbRuntimeConfig,
  type IgdbRuntimeConfig,
} from "@/server/igdb/igdb-runtime-config";
import { createTwitchApplicationTokenProvider } from "@/server/igdb/twitch-token-client";
import {
  sharedIgdbRequestLimiter,
  type IgdbRequestLimiter,
} from "@/server/igdb/igdb-request-limiter";
import {
  buildGameDetailQuery,
  buildGameSuggestionsQuery,
  buildGamesQuery,
  buildPlatformSuggestionsQuery,
  normalizeCatalogPagination,
} from "@/server/igdb/igdb-query-builder";
import {
  isCompleteCatalogGame,
  mapGameCard,
  mapGameDetail,
  mapPlatform,
} from "@/server/igdb/igdb-mapper";

type IgdbClientOptions = {
  config?: IgdbRuntimeConfig;
  httpClient?: HttpClient;
  requestLimiter?: IgdbRequestLimiter;
  tokenProvider?: ApplicationTokenProvider;
};

export function createIgdbClient(options: IgdbClientOptions = {}): IgdbClient {
  const config = options.config ?? getIgdbRuntimeConfig();
  const httpClient = options.httpClient ?? defaultHttpClient;
  const requestLimiter = options.requestLimiter ?? sharedIgdbRequestLimiter;
  const tokenProvider =
    options.tokenProvider ??
    createTwitchApplicationTokenProvider(config, httpClient);

  const postQuery = async (endpoint: "games" | "platforms", query: string) => {
    let token = await tokenProvider.getToken();

    for (let attempt = 0; attempt < 2; attempt += 1) {
      let response: AxiosResponse<unknown[]>;

      try {
        response = await requestLimiter.schedule(() =>
          requestRaw<unknown[]>(
            httpClient,
            `${config.apiBaseUrl}/${endpoint}`,
            {
              data: query,
              headers: {
                Authorization: `Bearer ${token}`,
                "Client-ID": config.clientId,
                "Content-Type": "text/plain",
              },
              method: "POST",
            },
          ),
        );
      } catch {
        throw new IgdbClientError(
          "IGDB_UNAVAILABLE",
          "The IGDB service is unavailable.",
        );
      }

      if (
        (response.status === 401 || response.status === 403) &&
        attempt === 0
      ) {
        token = await tokenProvider.getToken(true);
        continue;
      }

      const body: unknown = response.data;

      if (response.status < 200 || response.status >= 300) {
        throw toIgdbError(response.status);
      }

      if (!Array.isArray(body)) {
        throw new IgdbClientError(
          "IGDB_INVALID_RESPONSE",
          "The IGDB response is not a list.",
        );
      }

      return body;
    }

    throw new IgdbClientError(
      "IGDB_AUTH_FAILED",
      "The IGDB application token was rejected.",
    );
  };

  return {
    async getCatalog(
      filters: IgdbCatalogFilters = {},
    ): Promise<IgdbCatalogPage> {
      const { limit, offset } = normalizeCatalogPagination(filters);
      const body = await postQuery("games", buildGamesQuery(filters));
      const cards = body.map(mapGameCard).filter(isCompleteCatalogGame);

      return {
        hasNext: body.length > limit,
        items: cards.slice(0, limit),
        limit,
        offset,
      };
    },

    async getGameDetail(igdbId) {
      const body = await postQuery("games", buildGameDetailQuery(igdbId));

      return body.length === 0 ? null : mapGameDetail(body[0]);
    },

    async getGameSuggestions(query) {
      const requestQuery = buildGameSuggestionsQuery(query);

      if (requestQuery === null) {
        return [];
      }

      return (await postQuery("games", requestQuery))
        .map(mapGameCard)
        .filter(isCompleteCatalogGame)
        .map(({ igdbId, name }) => ({ igdbId, name }));
    },

    async getPlatformSuggestions(query) {
      const requestQuery = buildPlatformSuggestionsQuery(query);

      if (requestQuery === null) {
        return [];
      }

      return (await postQuery("platforms", requestQuery)).map(mapPlatform);
    },
  };
}

function toIgdbError(status: number): IgdbClientError {
  if (status === 401 || status === 403) {
    return new IgdbClientError(
      "IGDB_AUTH_FAILED",
      "The IGDB application token was rejected.",
    );
  }

  if (status === 429) {
    return new IgdbClientError(
      "IGDB_RATE_LIMITED",
      "The IGDB rate limit was reached.",
    );
  }

  if (status >= 500) {
    return new IgdbClientError(
      "IGDB_UNAVAILABLE",
      "The IGDB service is unavailable.",
    );
  }

  return new IgdbClientError(
    "IGDB_INVALID_RESPONSE",
    "The IGDB request was rejected.",
  );
}
