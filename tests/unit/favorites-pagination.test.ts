import { describe, expect, it } from "vitest";

import { getNextFavoritePage } from "@/features/favorites/favorites-pagination";

describe("favorites pagination", () => {
  it("advances by the server page number", () => {
    expect(
      getNextFavoritePage({
        hasNext: true,
        items: [],
        page: 3,
        pageSize: 20,
        total: 80,
      }),
    ).toBe(4);
  });
});
