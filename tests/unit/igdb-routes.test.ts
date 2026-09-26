import { describe, expect, it } from "vitest";

import {
  igdbErrorResponse,
  parseCatalogFilters,
  parseRequiredPositiveId,
} from "@/server/igdb/igdb-route";
import { IgdbClientError } from "@/shared/api/igdb";

describe("IGDB server routes", () => {
  it("parses only the supported catalog filters", () => {
    const result = parseCatalogFilters(
      new Request(
        "https://gamebook.example.test/api/igdb/games?limit=10&offset=20&name=zelda&platformId=6&yearFrom=2010&yearTo=2020",
      ),
    );

    expect(result).toEqual({
      filters: {
        limit: 10,
        name: "zelda",
        offset: 20,
        platformId: 6,
        yearFrom: 2010,
        yearTo: 2020,
      },
    });
  });

  it("rejects invalid ranges and IDs before contacting IGDB", async () => {
    const invalidRange = parseCatalogFilters(
      new Request(
        "https://gamebook.example.test/api/igdb/games?yearFrom=2020&yearTo=2010",
      ),
    );
    const invalidId = parseRequiredPositiveId("not-an-id", "igdbId");

    expect("response" in invalidRange).toBe(true);
    expect(invalidId).toHaveProperty("status", 400);
    await expect(
      invalidId instanceof Response ? invalidId.json() : null,
    ).resolves.toMatchObject({
      code: "IGDB_INVALID_REQUEST",
    });
  });

  it("maps server errors to safe HTTP responses without upstream details", async () => {
    const response = igdbErrorResponse(
      new IgdbClientError(
        "IGDB_RATE_LIMITED",
        "The IGDB rate limit was reached.",
      ),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      code: "IGDB_RATE_LIMITED",
      message: "The IGDB rate limit was reached.",
    });
  });
});
