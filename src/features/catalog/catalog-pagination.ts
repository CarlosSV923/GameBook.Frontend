import type { IgdbCatalogPage, IgdbGameCard } from "@/shared/api/igdb";

export function mergeCatalogItems(
  existingItems: readonly IgdbGameCard[],
  nextItems: readonly IgdbGameCard[],
): IgdbGameCard[] {
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
