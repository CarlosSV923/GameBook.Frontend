import { describe, expect, it, vi } from "vitest";

import { listAllFavoriteIds } from "@/features/catalog/catalog-favorites";
import type { GameClient } from "@/shared/api/game";

function createClient(
  pages: Array<{ hasNext: boolean; ids: number[] }>,
  onRequest?: (page: number, signal?: AbortSignal) => void,
) {
  return {
    listFavorites: vi.fn(
      async (
        _token: string,
        filters?: { page?: number; pageSize?: number },
        signal?: AbortSignal,
      ) => {
        const pageNumber = filters?.page ?? 1;
        onRequest?.(pageNumber, signal);
        const page = pages[pageNumber - 1] ?? {
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
          page: pageNumber,
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

  it("propagates an abort before requesting the first page", async () => {
    const controller = new AbortController();
    controller.abort();
    const client = createClient([{ hasNext: false, ids: [42] }]);

    await expect(
      listAllFavoriteIds(client, "jwt-token", controller.signal),
    ).rejects.toMatchObject({ name: "AbortError" });

    expect(client.listFavorites).not.toHaveBeenCalled();
  });

  it("stops the RxJS page expansion when the signal aborts", async () => {
    const controller = new AbortController();
    const client = createClient(
      [
        { hasNext: true, ids: [42] },
        { hasNext: false, ids: [7] },
      ],
      (page) => {
        if (page === 1) {
          controller.abort();
        }
      },
    );

    await expect(
      listAllFavoriteIds(client, "jwt-token", controller.signal),
    ).rejects.toMatchObject({ name: "AbortError" });

    expect(client.listFavorites).toHaveBeenCalledTimes(1);
  });
});
