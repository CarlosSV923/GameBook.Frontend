import { describe, expect, it } from "vitest";

import { formatGameReleaseDate } from "@/features/catalog/game-detail-formatting";

describe("game detail formatting", () => {
  it("shows only the precision confirmed by IGDB", () => {
    expect(formatGameReleaseDate("2024-06-18", "day")).toBe("2024-06-18");
    expect(formatGameReleaseDate("2024-06-18", "month")).toBe("2024-06");
    expect(formatGameReleaseDate("2024-06-18", "year")).toBe("2024");
    expect(formatGameReleaseDate(null, null)).toBe("—");
  });
});
