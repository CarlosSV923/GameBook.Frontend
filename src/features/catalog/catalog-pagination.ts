import type { IgdbCatalogPage } from "@/shared/api/igdb";

type GameWithIdentity = {
  igdbId: number;
};

export function mergeCatalogItems<T extends GameWithIdentity>(
  existingItems: readonly T[],
  nextItems: readonly T[],
): T[] {
  const seenIds = new Set(existingItems.map((item) => item.igdbId));
  const mergedItems = [...existingItems];

  for (const item of nextItems) {
    if (seenIds.has(item.igdbId)) {
      continue;
    }

    seenIds.add(item.igdbId);
    mergedItems.push(item);
  }

  return mergedItems;
}

export function getNextCatalogOffset(page: IgdbCatalogPage): number {
  return page.offset + page.limit;
}
