import type { AppliedCatalogFilters } from "@/features/catalog/ui/catalog-filters";

export const collectionKeys = {
  catalog: (filters: AppliedCatalogFilters) =>
    ["collection", "catalog", filters] as const,
  favorites: (userId: string, filters: AppliedCatalogFilters) =>
    ["collection", "favorites", userId, filters] as const,
};

export const favoriteIdsKey = (userId: string) =>
  ["favorite-ids", userId] as const;
export const gameDetailKey = (igdbId: number) =>
  ["game-detail", igdbId] as const;
export const suggestionKey = (source: string, type: string, term: string) =>
  ["suggestions", source, type, term] as const;
