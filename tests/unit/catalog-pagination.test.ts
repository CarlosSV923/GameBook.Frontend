import { describe, expect, it } from "vitest";

import {
  getNextCatalogOffset,
  mergeCatalogItems,
} from "@/features/catalog/catalog-pagination";

const game = (igdbId: number) => ({
  igdbId,
  imageUrl: null,
  name: `Game ${igdbId}`,
  platforms: [],
  rating: 80,
  released: "2024-01-01",
});

describe("catalog pagination", () => {
  it("advances by the server page offset and limit", () => {
    expect(
      getNextCatalogOffset({
        hasNext: true,
        items: [game(1)],
        limit: 20,
        offset: 20,
      }),
    ).toBe(40);
  });

  it("keeps existing items and removes duplicates from remote pages", () => {
    expect(
      mergeCatalogItems([game(1), game(2)], [game(2), game(3), game(3)]),
    ).toEqual([game(1), game(2), game(3)]);
  });
});
