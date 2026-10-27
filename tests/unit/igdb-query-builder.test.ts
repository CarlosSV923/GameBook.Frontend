import { describe, expect, it } from "vitest";

import {
  buildGameDetailQuery,
  buildGameSuggestionsQuery,
  buildGamesQuery,
  buildPlatformSuggestionsQuery,
  MIN_TOTAL_RATING_COUNT,
  normalizeCatalogPagination,
} from "@/server/igdb/igdb-query-builder";
import { IgdbClientError } from "@/features/catalog/model/igdb";

describe("IGDB query builder", () => {
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
    expect(query).not.toContain("total_rating_count");

    const defaultQuery = buildGamesQuery({});
    expect(defaultQuery).toContain("total_rating != null");
    expect(defaultQuery).toContain(
      `total_rating_count >= ${MIN_TOTAL_RATING_COUNT}`,
    );
    expect(defaultQuery).toContain("sort total_rating desc");
  });

  it("clamps catalog page sizes and offsets while preserving truncation", () => {
    expect(normalizeCatalogPagination({ limit: 100, offset: -2.8 })).toEqual({
      limit: 20,
      offset: 0,
    });
    expect(normalizeCatalogPagination({ limit: 0.8, offset: 8.9 })).toEqual({
      limit: 1,
      offset: 8,
    });
  });

  it("applies the rating-count threshold only to ranked catalog queries", () => {
    expect(buildGamesQuery({ platformId: 6 })).toContain(
      `total_rating_count >= ${MIN_TOTAL_RATING_COUNT}`,
    );
    expect(buildGamesQuery({ name: "Metroid" })).not.toContain(
      "total_rating_count",
    );
    expect(buildGameSuggestionsQuery("Metroid") ?? "").not.toContain(
      "total_rating_count",
    );
    expect(buildPlatformSuggestionsQuery("Nintendo") ?? "").not.toContain(
      "total_rating_count",
    );
  });

  it("builds detail and suggestion bodies from fixed fields and escaped terms", () => {
    const detailQuery = buildGameDetailQuery(42);
    expect(detailQuery).toContain(
      "fields id,name,first_release_date,cover.image_id,total_rating,platforms.id,platforms.name,summary,genres.name,involved_companies.developer,involved_companies.company.name,release_dates.date,release_dates.y,release_dates.m,release_dates.d,screenshots.image_id; where id = 42; limit 1;",
    );
    expect(detailQuery).not.toContain("total_rating_count");
    expect(buildGameSuggestionsQuery('A \\"quoted\\"')).toContain(
      'search "A \\\\\\\"quoted\\\\\\\""',
    );
    expect(buildGameSuggestionsQuery("  ")).toBeNull();
    expect(buildPlatformSuggestionsQuery('  Xbox "Series"  ')).toBe(
      'fields id,name; search "Xbox \\"Series\\""; limit 20;',
    );
    expect(buildPlatformSuggestionsQuery(" ")).toBeNull();
  });

  it("rejects invalid detail IDs and year ranges", () => {
    expect(() => buildGameDetailQuery(0)).toThrow(IgdbClientError);
    expect(buildGamesQuery({ yearFrom: 2024 })).toContain(
      "first_release_date >= 1704067200 & first_release_date < 1735689600",
    );
    expect(() => buildGamesQuery({ yearFrom: 2025, yearTo: 2024 })).toThrow(
      "The year range is invalid.",
    );
  });
});
