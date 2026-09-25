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

  it("serializes combined filters for the server proxy", async () => {
    const { fetcher, requests } = createMockFetcher([{ body: page }]);
    const client = createIgdbCatalogClient({ fetcher });

    await client.listCatalog({
      name: " zelda ",
      platformId: 6,
      yearFrom: 2010,
      yearTo: 2020,
    });

    expect(requests[0].url).toBe(
      "/api/igdb/games?limit=20&name=zelda&platformId=6&yearFrom=2010&yearTo=2020",
    );
  });

  it("serializes the requested page limit and offset", async () => {
    const { fetcher, requests } = createMockFetcher([{ body: page }]);
    const client = createIgdbCatalogClient({ fetcher });

    await client.listCatalog({ limit: 20, offset: 40 });

    expect(requests[0].url).toBe("/api/igdb/games?limit=20&offset=40");
  });

  it("requests validated game and platform suggestions", async () => {
    const { fetcher, requests } = createMockFetcher([
      { body: [{ igdbId: 42, name: "The Game" }] },
      { body: [{ id: 6, name: "PC" }] },
    ]);
    const client = createIgdbCatalogClient({ fetcher });

    await expect(client.getGameSuggestions("the game")).resolves.toEqual([
      { igdbId: 42, name: "The Game" },
    ]);
    await expect(client.getPlatformSuggestions("pc")).resolves.toEqual([
      { id: 6, name: "PC" },
    ]);

    expect(requests.map((request) => request.url)).toEqual([
      "/api/igdb/games/suggestions?query=the%20game",
      "/api/igdb/platforms?query=pc",
    ]);
  });

  it("requests and validates game details", async () => {
    const detail = {
      ...page.items[0],
      developers: ["Studio"],
      genres: ["Adventure"],
      releaseDatePrecision: "day",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_med/id.jpg",
      ],
      summary: "A game summary.",
    };
    const { fetcher, requests } = createMockFetcher([{ body: detail }]);
    const client = createIgdbCatalogClient({ fetcher });

    await expect(client.getGameDetail(42)).resolves.toEqual(detail);
    expect(requests[0].url).toBe("/api/igdb/games/42");
  });
});
