import { describe, expect, it } from "vitest";

import { buildGamesQuery, createIgdbClient } from "@/server/igdb/igdb-client";
import { createTwitchApplicationTokenProvider } from "@/server/igdb/twitch-token-client";
import { createMockFetcher, createMockTokenProvider } from "@/shared/api/mocks";
import { IgdbClientError } from "@/shared/api/igdb";

const config = {
  apiBaseUrl: "https://api.igdb.example.test/v4",
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  twitchTokenUrl: "https://id.twitch.example.test/oauth2/token",
};

const rawGame = {
  cover: { image_id: "cover-id" },
  first_release_date: 1704067200,
  id: 42,
  name: "Game",
  platforms: [{ id: 6, name: "PC" }],
  total_rating: 88.5,
};

const rawDetail = {
  ...rawGame,
  genres: [{ name: "Adventure" }],
  involved_companies: [
    { company: { name: "Studio" }, developer: true },
    { company: { name: "Publisher" }, developer: false },
  ],
  release_dates: [{ d: 1, date: 1704067200, m: 1, y: 2024 }],
  screenshots: [{ image_id: "screen-id" }],
  summary: "A game summary.",
};

describe("IGDB query adapter", () => {
  it("builds fixed, escaped catalog queries with the v3 filters", () => {
    const query = buildGamesQuery({
      limit: 20,
      name: 'A "quoted" game',
      offset: 10,
      platformId: 6,
      yearFrom: 2020,
      yearTo: 2024,
    });

    expect(query).toContain('search "A \\"quoted\\" game"');
    expect(query).toContain("platforms = 6");
    expect(query).toContain("first_release_date >= 1577836800");
    expect(query).toContain("first_release_date < 1735689600");
    expect(query).toContain("limit 21");
    expect(query).toContain("offset 10");
    expect(query).toContain("name != null");
    expect(query).toContain("cover != null");
    expect(query).toContain("first_release_date != null");
    expect(query).toContain("total_rating != null");
    expect(query).toContain("platforms != null");

    const defaultQuery = buildGamesQuery({});
    expect(defaultQuery).toContain("total_rating != null");
    expect(defaultQuery).toContain("sort total_rating desc");
  });
});

describe("IGDB client", () => {
  it("uses the fixed games endpoint and maps the catalog response", async () => {
    const { fetcher, requests } = createMockFetcher([
      { body: [rawGame, { ...rawGame, id: 43, name: "Second game" }] },
    ]);
    const token = createMockTokenProvider(["application-token"]);
    const client = createIgdbClient({
      config,
      fetcher,
      tokenProvider: token.provider,
    });

    const result = await client.getCatalog({ limit: 1 });

    expect(result).toEqual({
      hasNext: true,
      items: [
        {
          igdbId: 42,
          imageUrl:
            "https://images.igdb.com/igdb/image/upload/t_cover_big/cover-id.jpg",
          name: "Game",
          platforms: [{ id: 6, name: "PC" }],
          rating: 88.5,
          released: "2024-01-01",
        },
      ],
      limit: 1,
      offset: 0,
    });
    expect(requests[0].url).toBe("https://api.igdb.example.test/v4/games");
    expect(requests[0].method).toBe("POST");
    expect(requests[0].headers.get("client-id")).toBe("test-client-id");
    expect(requests[0].headers.get("authorization")).toBe(
      "Bearer application-token",
    );
    expect(token.calls).toEqual([false]);
  });

  it("excludes incomplete games from the catalog and name suggestions", async () => {
    const incompleteGame = {
      ...rawGame,
      cover: undefined,
      id: 43,
      name: "Incomplete game",
    };
    const { fetcher, requests } = createMockFetcher([
      { body: [rawGame, incompleteGame] },
      { body: [rawGame, incompleteGame] },
    ]);
    const client = createIgdbClient({
      config,
      fetcher,
      tokenProvider: createMockTokenProvider().provider,
    });

    await expect(client.getCatalog({ limit: 20 })).resolves.toMatchObject({
      items: [
        {
          igdbId: 42,
          name: "Game",
        },
      ],
    });
    await expect(client.getGameSuggestions("game")).resolves.toEqual([
      { igdbId: 42, name: "Game" },
    ]);

    expect(requests[0].body).toContain(
      "where name != null & cover != null & first_release_date != null & total_rating != null & platforms != null",
    );
    expect(requests[1].body).toContain(
      "fields id,name,first_release_date,cover.image_id,total_rating,platforms.id,platforms.name",
    );
    expect(requests[1].body).toContain(
      "where name != null & cover != null & first_release_date != null & total_rating != null & platforms != null",
    );
  });

  it("refreshes the application token once after an IGDB auth failure", async () => {
    const { fetcher, requests } = createMockFetcher([
      { body: { message: "expired" }, status: 401 },
      { body: [rawGame] },
    ]);
    const token = createMockTokenProvider(["expired-token", "refreshed-token"]);
    const client = createIgdbClient({
      config,
      fetcher,
      tokenProvider: token.provider,
    });

    await client.getGameDetail(42);

    expect(token.calls).toEqual([false, true]);
    expect(requests[0].headers.get("authorization")).toBe(
      "Bearer expired-token",
    );
    expect(requests[1].headers.get("authorization")).toBe(
      "Bearer refreshed-token",
    );
  });

  it("maps detail fields and preserves the release date precision", async () => {
    const { fetcher, requests } = createMockFetcher([{ body: [rawDetail] }]);
    const client = createIgdbClient({
      config,
      fetcher,
      tokenProvider: createMockTokenProvider().provider,
    });

    await expect(client.getGameDetail(42)).resolves.toMatchObject({
      developers: ["Studio"],
      genres: ["Adventure"],
      releaseDatePrecision: "day",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_med/screen-id.jpg",
      ],
      summary: "A game summary.",
    });
    expect(requests[0].body).toContain("release_dates.date");
    expect(requests[0].body).toContain("release_dates.d");
  });

  it("maps malformed responses and rate limits to safe domain errors", async () => {
    const malformed = createMockFetcher([{ body: { result: "not-an-array" } }]);
    const malformedClient = createIgdbClient({
      config,
      fetcher: malformed.fetcher,
      tokenProvider: createMockTokenProvider().provider,
    });

    await expect(malformedClient.getCatalog()).rejects.toMatchObject({
      code: "IGDB_INVALID_RESPONSE",
    });

    const limited = createMockFetcher([
      { status: 429, body: { message: "slow down" } },
    ]);
    const limitedClient = createIgdbClient({
      config,
      fetcher: limited.fetcher,
      tokenProvider: createMockTokenProvider().provider,
    });

    const limitedRequest = limitedClient.getCatalog();
    await expect(limitedRequest).rejects.toBeInstanceOf(IgdbClientError);
    await expect(limitedRequest).rejects.toMatchObject({
      code: "IGDB_RATE_LIMITED",
    });
  });

  it("maps upstream server failures to an unavailable domain error", async () => {
    const { fetcher } = createMockFetcher([
      { status: 503, body: { message: "temporarily unavailable" } },
    ]);
    const client = createIgdbClient({
      config,
      fetcher,
      tokenProvider: createMockTokenProvider().provider,
    });

    await expect(client.getCatalog()).rejects.toMatchObject({
      code: "IGDB_UNAVAILABLE",
    });
  });
});

describe("Twitch application token provider", () => {
  it("sends credentials only to Twitch and caches the application token", async () => {
    const { fetcher, requests } = createMockFetcher([
      { body: { access_token: "twitch-token", expires_in: 3600 } },
    ]);
    const provider = createTwitchApplicationTokenProvider(config, fetcher);

    await expect(provider.getToken()).resolves.toBe("twitch-token");
    await expect(provider.getToken()).resolves.toBe("twitch-token");

    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe(config.twitchTokenUrl);
    expect(requests[0].body).toContain("client_id=test-client-id");
    expect(requests[0].body).toContain("client_secret=test-client-secret");
    expect(requests[0].body).toContain("grant_type=client_credentials");
  });

  it("maps rejected Twitch token responses to a safe auth error", async () => {
    const { fetcher } = createMockFetcher([
      { status: 401, body: { error: "invalid_client" } },
    ]);
    const provider = createTwitchApplicationTokenProvider(config, fetcher);

    await expect(provider.getToken()).rejects.toMatchObject({
      code: "IGDB_AUTH_FAILED",
    });
  });
});
