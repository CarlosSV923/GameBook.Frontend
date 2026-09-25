import { describe, expect, it } from "vitest";

import {
  formatGamePlatforms,
  formatGameRating,
  formatGameYear,
} from "@/features/catalog/game-card-formatting";

describe("GameBook card metadata", () => {
  it("converts IGDB ratings from 0-100 to one-decimal 0-10 values", () => {
    expect(formatGameRating(83)).toBe("8.3");
    expect(formatGameRating(88.5)).toBe("8.9");
    expect(formatGameRating(null)).toBe("—");
  });

  it("keeps release year and platform fallbacks safe", () => {
    expect(formatGameYear("2024-01-01")).toBe("2024");
    expect(formatGameYear(null)).toBe("—");
    expect(formatGamePlatforms([{ id: 6, name: "PC" }])).toBe("PC");
    expect(formatGamePlatforms([])).toBe("—");
  });
});
