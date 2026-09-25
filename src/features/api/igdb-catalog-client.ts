import { ApiClientError, requestJson, type Fetcher } from "@/shared/api/http";
import type { IgdbCatalogPage, IgdbGameCard } from "@/shared/api/igdb";

type IgdbCatalogClientOptions = {
  fetcher?: Fetcher;
};

export interface IgdbCatalogClient {
  listCatalog(signal?: AbortSignal): Promise<IgdbCatalogPage>;
}

export function createIgdbCatalogClient(
  options: IgdbCatalogClientOptions = {},
): IgdbCatalogClient {
  const fetcher = options.fetcher ?? fetch;

  return {
    async listCatalog(signal) {
      const page = await requestJson<unknown>(
        fetcher,
        "/api/igdb/games?limit=20",
        {
          headers: { Accept: "application/json" },
          method: "GET",
          signal,
        },
      );

      if (!isCatalogPage(page)) {
        throw new ApiClientError(
          502,
          { code: "IGDB_INVALID_RESPONSE" },
          "The catalog response is invalid.",
        );
      }

      return page;
    },
  };
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

function isPlatform(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return Number.isInteger(record.id) && typeof record.name === "string";
}
