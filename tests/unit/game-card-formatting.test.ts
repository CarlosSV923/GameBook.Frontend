import { describe, expect, it } from "vitest";

import {
  formatGamePlatforms,
  formatGameRating,
  formatGameYear,
} from "@/features/catalog/model/game-card-formatting";

describe("GameBook card metadata", () => {
  it("shows rounded IGDB ratings on the 0-100 scale", () => {
    expect(formatGameRating(83)).toBe("83");
    expect(formatGameRating(88.5)).toBe("89");
    expect(formatGameRating(null)).toBe("—");
  });

  it("keeps release year and platform fallbacks safe", () => {
    expect(formatGameYear("2024-01-01")).toBe("2024");
    expect(formatGameYear(null)).toBe("—");
    expect(formatGamePlatforms([{ id: 6, name: "PC" }])).toBe("PC");
    expect(formatGamePlatforms([])).toBe("—");
  });
});
