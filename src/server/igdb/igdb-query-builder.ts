import "server-only";

import { IgdbClientError, type IgdbCatalogFilters } from "@/shared/api/igdb";

const catalogFields = [
  "id",
  "name",
  "first_release_date",
  "cover.image_id",
  "total_rating",
  "platforms.id",
  "platforms.name",
].join(",");

const detailFields = [
  catalogFields,
  "summary",
  "genres.name",
  "involved_companies.developer",
  "involved_companies.company.name",
  "release_dates.date",
  "release_dates.y",
  "release_dates.m",
  "release_dates.d",
  "screenshots.image_id",
].join(",");

const completeCatalogGameWhere = [
  "name != null",
  "cover != null",
  "first_release_date != null",
  "total_rating != null",
  "platforms != null",
];

export type CatalogPagination = {
  limit: number;
  offset: number;
};

export function normalizeCatalogPagination(
  filters: IgdbCatalogFilters,
): CatalogPagination {
  return {
    limit: clamp(filters.limit ?? 20, 1, 20),
    offset: Math.max(0, Math.trunc(filters.offset ?? 0)),
  };
}

export function buildGamesQuery(filters: IgdbCatalogFilters): string {
  const name = filters.name?.trim();
  const { limit, offset } = normalizeCatalogPagination(filters);
  const where = [...completeCatalogGameWhere];

  if (filters.platformId !== undefined) {
    where.push(`platforms = ${Math.trunc(filters.platformId)}`);
  }

  if (filters.yearFrom !== undefined || filters.yearTo !== undefined) {
    const yearFrom = filters.yearFrom ?? filters.yearTo;
    const yearTo = filters.yearTo ?? filters.yearFrom;

    if (yearFrom === undefined || yearTo === undefined) {
      throw new IgdbClientError(
        "IGDB_INVALID_RESPONSE",
        "Both years are required for a year range.",
      );
    }

    if (
      !Number.isInteger(yearFrom) ||
      !Number.isInteger(yearTo) ||
      yearFrom > yearTo
    ) {
      throw new IgdbClientError(
        "IGDB_INVALID_RESPONSE",
        "The year range is invalid.",
      );
    }

    where.push(
      `first_release_date >= ${utcYearStart(yearFrom)} & first_release_date < ${utcYearStart(yearTo + 1)}`,
    );
  }

  const clauses = [`fields ${catalogFields}`];

  if (name) {
    clauses.push(`search "${escapeSearchTerm(name)}"`);
  }

  clauses.push(`where ${where.join(" & ")}`);

  if (!name) {
    clauses.push("sort total_rating desc");
  }

  clauses.push(`limit ${limit + 1}`, `offset ${offset}`);
  return `${clauses.join("; ")};`;
}

export function buildGameDetailQuery(igdbId: number): string {
  if (!Number.isInteger(igdbId) || igdbId < 1) {
    throw new IgdbClientError(
      "IGDB_INVALID_RESPONSE",
      "The IGDB game ID is invalid.",
    );
  }

  return `fields ${detailFields}; where id = ${igdbId}; limit 1;`;
}

export function buildGameSuggestionsQuery(query: string): string | null {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return null;
  }

  return `fields ${catalogFields}; search "${escapeSearchTerm(normalizedQuery)}"; where ${completeCatalogGameWhere.join(" & ")}; limit 10;`;
}

export function buildPlatformSuggestionsQuery(query: string): string | null {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return null;
  }

  return `fields id,name; search "${escapeSearchTerm(normalizedQuery)}"; limit 20;`;
}

function escapeSearchTerm(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function utcYearStart(year: number): number {
  if (!Number.isInteger(year) || year < 1 || year > 9999) {
    throw new IgdbClientError("IGDB_INVALID_RESPONSE", "The year is invalid.");
  }

  return Math.floor(Date.UTC(year, 0, 1) / 1000);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}
