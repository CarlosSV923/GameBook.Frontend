import { describe, expect, it } from "vitest";

import {
  isCompleteCatalogGame,
  mapGameCard,
  mapGameDetail,
  mapPlatform,
} from "@/server/igdb/igdb-mapper";

const validGame = {
  cover: { image_id: "cover-id" },
  first_release_date: 1704067200,
  id: 42,
  name: "Game",
  platforms: [{ id: 6, name: "PC" }],
  total_rating: 88.5,
};

describe("IGDB mapper", () => {
  it("normalizes nullable card fields and identifies incomplete catalog games", () => {
    const mapped = mapGameCard({
      id: 42,
      name: "Game",
      cover: null,
      first_release_date: null,
      total_rating: null,
      platforms: null,
    });

    expect(mapped).toEqual({
      igdbId: 42,
      imageUrl: null,
      name: "Game",
      platforms: [],
      rating: null,
      released: null,
    });
    expect(isCompleteCatalogGame(mapped)).toBe(false);
  });

  it("preserves release date precision and drops non-developer companies", () => {
    const base = {
      ...validGame,
      involved_companies: [
        { company: { name: "Studio" }, developer: true },
        { company: { name: "Publisher" }, developer: false },
      ],
    };

    expect(
      mapGameDetail({
        ...base,
        release_dates: [{ date: 1704067200, d: 1, m: 1, y: 2024 }],
      }),
    ).toMatchObject({ developers: ["Studio"], releaseDatePrecision: "day" });
    expect(
      mapGameDetail({
        ...base,
        release_dates: [{ date: 1704067200, m: 1, y: 2024 }],
      }),
    ).toMatchObject({ releaseDatePrecision: "month" });
    expect(
      mapGameDetail({
        ...base,
        release_dates: [{ date: 1704067200, y: 2024 }],
      }),
    ).toMatchObject({ releaseDatePrecision: "year" });
    expect(
      mapGameDetail({
        ...base,
        first_release_date: null,
        release_dates: "ignored without a first release date",
      }),
    ).toMatchObject({ releaseDatePrecision: null });
  });

  it("rejects invalid payload fields with IGDB domain errors", () => {
    for (const payload of [
      { ...validGame, id: 0 },
      { ...validGame, name: " " },
      { ...validGame, total_rating: 101 },
      { ...validGame, cover: { image_id: "../unsafe" } },
      { ...validGame, platforms: [{ id: 0, name: "PC" }] },
      { ...validGame, first_release_date: "2024-01-01" },
    ]) {
      expect(() => mapGameCard(payload)).toThrowError(
        expect.objectContaining({
          code: "IGDB_INVALID_RESPONSE",
          name: "IgdbClientError",
        }),
      );
    }

    expect(() => mapPlatform({ id: 1, name: " " })).toThrowError(
      expect.objectContaining({ code: "IGDB_INVALID_RESPONSE" }),
    );
    expect(() =>
      mapGameDetail({
        ...validGame,
        release_dates: [{ date: 1704067200, d: 32, m: 1, y: 2024 }],
      }),
    ).toThrowError(expect.objectContaining({ code: "IGDB_INVALID_RESPONSE" }));
  });
});
