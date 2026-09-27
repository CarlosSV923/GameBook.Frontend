import { describe, expect, it, vi } from "vitest";

import { listAllFavoriteIds } from "@/features/catalog/catalog-favorites";
import type { GameClient } from "@/shared/api/game";

function createClient(pages: Array<{ hasNext: boolean; ids: number[] }>) {
  return {
    listFavorites: vi.fn(
      async (
        _token: string,
        filters?: { page?: number; pageSize?: number },
      ) => {
        const page = pages[(filters?.page ?? 1) - 1] ?? {
          hasNext: false,
          ids: [],
        };

        return {
          hasNext: page.hasNext,
          items: page.ids.map((igdbId) => ({
            igdbId,
            imageUrl: null,
            name: `Game ${igdbId}`,
            platforms: [],
            rating: 80,
            released: "2020-01-01",
          })),
          page: filters?.page ?? 1,
          pageSize: filters?.pageSize ?? 20,
          total: pages.reduce(
            (total, current) => total + current.ids.length,
            0,
          ),
        };
      },
    ),
  } as unknown as GameClient;
}

describe("catalog favorites", () => {
  it("loads every favorite page into an identity set", async () => {
    const client = createClient([
      { hasNext: true, ids: [42, 7] },
      { hasNext: false, ids: [9, 42] },
    ]);

    await expect(listAllFavoriteIds(client, "jwt-token")).resolves.toEqual(
      new Set([42, 7, 9]),
    );

    expect(client.listFavorites).toHaveBeenCalledTimes(2);
    expect(client.listFavorites).toHaveBeenNthCalledWith(
      1,
      "jwt-token",
      { page: 1, pageSize: 1000 },
      undefined,
    );
    expect(client.listFavorites).toHaveBeenNthCalledWith(
      2,
      "jwt-token",
      { page: 2, pageSize: 1000 },
      undefined,
    );
  });

  it("stops before a second request when the first page is complete", async () => {
    const client = createClient([{ hasNext: false, ids: [42] }]);

    await expect(listAllFavoriteIds(client, "jwt-token")).resolves.toEqual(
      new Set([42]),
    );

    expect(client.listFavorites).toHaveBeenCalledTimes(1);
  });
});
