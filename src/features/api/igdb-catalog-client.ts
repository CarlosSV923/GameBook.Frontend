import { ApiClientError, requestJson, type Fetcher } from "@/shared/api/http";
import type {
  IgdbCatalogFilters,
  IgdbCatalogPage,
  IgdbGameCard,
  IgdbGameSuggestion,
  IgdbPlatformSuggestion,
} from "@/shared/api/igdb";

type IgdbCatalogClientOptions = {
  fetcher?: Fetcher;
};

export interface IgdbCatalogClient {
  getGameSuggestions(
    query: string,
    signal?: AbortSignal,
  ): Promise<IgdbGameSuggestion[]>;
  getPlatformSuggestions(
    query: string,
    signal?: AbortSignal,
  ): Promise<IgdbPlatformSuggestion[]>;
  listCatalog(
    filters?: IgdbCatalogFilters,
    signal?: AbortSignal,
  ): Promise<IgdbCatalogPage>;
}

export function createIgdbCatalogClient(
  options: IgdbCatalogClientOptions = {},
): IgdbCatalogClient {
  const fetcher = options.fetcher ?? fetch;

  return {
    async getGameSuggestions(query, signal) {
      const suggestions = await requestJson<unknown>(
        fetcher,
        `/api/igdb/games/suggestions?query=${encodeURIComponent(query.trim())}`,
        {
          headers: { Accept: "application/json" },
          method: "GET",
          signal,
        },
      );

      if (!Array.isArray(suggestions) || !suggestions.every(isGameSuggestion)) {
        throw invalidResponse("game suggestions");
      }

      return suggestions;
    },
    async getPlatformSuggestions(query, signal) {
      const suggestions = await requestJson<unknown>(
        fetcher,
        `/api/igdb/platforms?query=${encodeURIComponent(query.trim())}`,
        {
          headers: { Accept: "application/json" },
          method: "GET",
          signal,
        },
      );

      if (
        !Array.isArray(suggestions) ||
        !suggestions.every(isPlatformSuggestion)
      ) {
        throw invalidResponse("platform suggestions");
      }

      return suggestions;
    },
    async listCatalog(filters = {}, signal) {
      const params = new URLSearchParams({ limit: "20" });

      if (filters.name?.trim()) {
        params.set("name", filters.name.trim());
      }
      if (filters.platformId !== undefined) {
        params.set("platformId", String(filters.platformId));
      }
      if (filters.yearFrom !== undefined) {
        params.set("yearFrom", String(filters.yearFrom));
      }
      if (filters.yearTo !== undefined) {
        params.set("yearTo", String(filters.yearTo));
      }

      const page = await requestJson<unknown>(
        fetcher,
        `/api/igdb/games?${params.toString()}`,
        {
          headers: { Accept: "application/json" },
          method: "GET",
          signal,
        },
      );

      if (!isCatalogPage(page)) {
        throw invalidResponse("catalog");
      }

      return page;
    },
  };
}

function invalidResponse(resource: string): ApiClientError {
  return new ApiClientError(
    502,
    { code: "IGDB_INVALID_RESPONSE" },
    `The IGDB ${resource} response is invalid.`,
  );
}

function isCatalogPage(value: unknown): value is IgdbCatalogPage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.hasNext === "boolean" &&
    Number.isInteger(record.limit) &&
    Number.isInteger(record.offset) &&
    Array.isArray(record.items) &&
    record.items.every(isGameCard)
  );
}

function isGameCard(value: unknown): value is IgdbGameCard {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    Number.isInteger(record.igdbId) &&
    typeof record.name === "string" &&
    (record.imageUrl === null || typeof record.imageUrl === "string") &&
    (record.rating === null || typeof record.rating === "number") &&
    (record.released === null || typeof record.released === "string") &&
    Array.isArray(record.platforms) &&
    record.platforms.every(isPlatform)
  );
}

function isGameSuggestion(value: unknown): value is IgdbGameSuggestion {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return Number.isInteger(record.igdbId) && typeof record.name === "string";
}

function isPlatform(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return Number.isInteger(record.id) && typeof record.name === "string";
}

function isPlatformSuggestion(value: unknown): value is IgdbPlatformSuggestion {
  return isPlatform(value);
}
