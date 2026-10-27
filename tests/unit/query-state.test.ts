import { describe, expect, it } from "vitest";

import { getNextFavoritePage } from "@/features/favorites/model/favorites-pagination";
import { flattenCollection } from "@/shared/query/use-infinite-collection";
import {
  collectionKeys,
  favoriteIdsKey,
  gameDetailKey,
  suggestionKey,
} from "@/shared/query/query-keys";

const item = (igdbId: number) => ({ igdbId, name: `Game ${igdbId}` });

describe("server state query helpers", () => {
  it("keeps collection context, filters, and user in query identity", () => {
    expect(collectionKeys.catalog({ name: "zelda" })).toEqual([
      "collection",
      "catalog",
      { name: "zelda" },
    ]);
    expect(collectionKeys.favorites("user-1", {})).not.toEqual(
      collectionKeys.favorites("user-2", {}),
    );
    expect(favoriteIdsKey("user-1")).toEqual(["favorite-ids", "user-1"]);
    expect(gameDetailKey(42)).toEqual(["game-detail", 42]);
    expect(suggestionKey("favorites", "game", "zelda")).toEqual([
      "suggestions",
      "favorites",
      "game",
      "zelda",
    ]);
  });

  it("advances favorite pages by one", () => {
    expect(
      getNextFavoritePage({
        hasNext: true,
        items: [],
        page: 3,
        pageSize: 20,
        total: 80,
      }),
    ).toBe(4);
  });

  it("flattens pages and removes repeated IGDB identities", () => {
    expect(
      flattenCollection({
        pages: [
          { items: [item(1), item(2)] },
          { items: [item(2), item(3), item(3)] },
        ],
        pageParams: [0, 2],
      }),
    ).toEqual([item(1), item(2), item(3)]);
  });
});
