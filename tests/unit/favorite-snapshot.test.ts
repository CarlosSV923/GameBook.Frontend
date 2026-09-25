import { describe, expect, it } from "vitest";

import { toFavoriteSnapshot } from "@/features/favorites/favorite-snapshot";

describe("favorite snapshot", () => {
  it("keeps only the basic IGDB fields owned by the Game snapshot", () => {
    const detail = {
      developers: ["Studio"],
      genres: ["Adventure"],
      igdbId: 42,
      imageUrl: "https://images.example.test/cover.jpg",
      name: "A Short Hike",
      platforms: [{ id: 6, name: "PC" }],
      rating: 83,
      releaseDatePrecision: "day" as const,
      released: "2019-07-30",
      screenshots: ["https://images.example.test/shot.jpg"],
      summary: "A short adventure.",
    };

    expect(toFavoriteSnapshot(detail)).toEqual({
      imageUrl: detail.imageUrl,
      name: detail.name,
      platforms: detail.platforms,
      rating: detail.rating,
      released: detail.released,
    });
  });
});
