import { describe, expect, it } from "vitest";

import { createIgdbCatalogClient } from "@/features/api/igdb-catalog-client";
import { createMockFetcher } from "@/shared/api/mocks";

const page = {
  hasNext: true,
  items: [
    {
      igdbId: 42,
      imageUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/id.jpg",
      name: "Game",
      platforms: [{ id: 6, name: "PC" }],
      rating: 88.5,
      released: "2024-01-01",
    },
  ],
  limit: 20,
  offset: 0,
};

describe("IGDB catalog browser client", () => {
  it("requests the server proxy and returns validated catalog pages", async () => {
    const { fetcher, requests } = createMockFetcher([{ body: page }]);
    const client = createIgdbCatalogClient({ fetcher });

    await expect(client.listCatalog()).resolves.toEqual(page);
    expect(requests[0].url).toBe("/api/igdb/games?limit=20");
    expect(requests[0].method).toBe("GET");
    expect(requests[0].headers.get("accept")).toBe("application/json");
  });

  it("rejects an unsafe response shape before rendering it", async () => {
    const { fetcher } = createMockFetcher([
      { body: { items: "not-an-array" } },
    ]);
    const client = createIgdbCatalogClient({ fetcher });

    await expect(client.listCatalog()).rejects.toMatchObject({
      code: "IGDB_INVALID_RESPONSE",
      status: 502,
    });
  });
});
