import "server-only";

import { readResponseBody, type Fetcher } from "@/shared/api/http";
import {
  IgdbClientError,
  type ApplicationTokenProvider,
  type IgdbCatalogFilters,
  type IgdbCatalogPage,
  type IgdbClient,
  type IgdbGameDetail,
  type IgdbGameSuggestion,
  type IgdbPlatformSuggestion,
} from "@/shared/api/igdb";
import type { Platform } from "@/shared/api/game";
import {
  getIgdbRuntimeConfig,
  type IgdbRuntimeConfig,
} from "@/server/igdb/igdb-runtime-config";
import { createTwitchApplicationTokenProvider } from "@/server/igdb/twitch-token-client";

type IgdbClientOptions = {
  config?: IgdbRuntimeConfig;
  fetcher?: Fetcher;
  tokenProvider?: ApplicationTokenProvider;
};

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
  "screenshots.image_id",
].join(",");

export function createIgdbClient(options: IgdbClientOptions = {}): IgdbClient {
  const config = options.config ?? getIgdbRuntimeConfig();
  const fetcher = options.fetcher ?? fetch;
  const tokenProvider =
    options.tokenProvider ??
    createTwitchApplicationTokenProvider(config, fetcher);

  const postQuery = async (endpoint: "games" | "platforms", query: string) => {
    let token = await tokenProvider.getToken();

    for (let attempt = 0; attempt < 2; attempt += 1) {
      let response: Response;

      try {
        response = await fetcher(`${config.apiBaseUrl}/${endpoint}`, {
          body: query,
          headers: {
            Authorization: `Bearer ${token}`,
            "Client-ID": config.clientId,
            "Content-Type": "text/plain",
          },
          method: "POST",
        });
      } catch {
        throw new IgdbClientError(
          "IGDB_UNAVAILABLE",
          "The IGDB service is unavailable.",
        );
      }

      if (
        (response.status === 401 || response.status === 403) &&
        attempt === 0
      ) {
        token = await tokenProvider.getToken(true);
        continue;
      }

      let body: unknown;

      try {
        body = await readResponseBody(response);
      } catch {
        throw new IgdbClientError(
          "IGDB_INVALID_RESPONSE",
          "The IGDB response is invalid.",
        );
      }

      if (!response.ok) {
        throw toIgdbError(response.status);
      }

      if (!Array.isArray(body)) {
        throw new IgdbClientError(
          "IGDB_INVALID_RESPONSE",
          "The IGDB response is not a list.",
        );
      }

      return body;
    }

    throw new IgdbClientError(
      "IGDB_AUTH_FAILED",
      "The IGDB application token was rejected.",
    );
  };

  return {
    async getCatalog(filters = {}): Promise<IgdbCatalogPage> {
      const limit = clamp(filters.limit ?? 20, 1, 20);
      const offset = Math.max(0, Math.trunc(filters.offset ?? 0));
      const body = await postQuery(
        "games",
        buildGamesQuery({ ...filters, limit, offset }),
      );
      const cards = body.map((value) => normalizeGameCard(value));

      return {
        hasNext: cards.length > limit,
        items: cards.slice(0, limit),
        limit,
        offset,
      };
    },

    async getGameDetail(igdbId: number): Promise<IgdbGameDetail | null> {
      if (!Number.isInteger(igdbId) || igdbId < 1) {
        throw new IgdbClientError(
          "IGDB_INVALID_RESPONSE",
          "The IGDB game ID is invalid.",
        );
      }

      const body = await postQuery(
        "games",
        `fields ${detailFields}; where id = ${igdbId}; limit 1;`,
      );

      if (body.length === 0) {
        return null;
      }

      return normalizeGameDetail(body[0]);
    },

    async getGameSuggestions(query: string): Promise<IgdbGameSuggestion[]> {
      const normalizedQuery = query.trim();

      if (!normalizedQuery) {
        return [];
      }

      const body = await postQuery(
        "games",
        `fields id,name; search "${escapeSearchTerm(normalizedQuery)}"; limit 10;`,
      );

      return body.map((value) => {
        const record = asRecord(value);
        const igdbId = readPositiveInteger(record.id, "game ID");
        const name = readRequiredString(record.name, "game name");

        return { igdbId, name };
      });
    },

    async getPlatformSuggestions(
      query: string,
    ): Promise<IgdbPlatformSuggestion[]> {
      const normalizedQuery = query.trim();

      if (!normalizedQuery) {
        return [];
      }

      const body = await postQuery(
        "platforms",
        `fields id,name; search "${escapeSearchTerm(normalizedQuery)}"; limit 20;`,
      );

      return body.map((value) => normalizePlatform(value));
    },
  };
}

export function buildGamesQuery(filters: IgdbCatalogFilters): string {
  const name = filters.name?.trim();
  const limit = clamp(filters.limit ?? 20, 1, 20) + 1;
  const offset = Math.max(0, Math.trunc(filters.offset ?? 0));
  const where: string[] = [];

  if (!name) {
    where.push("total_rating != null");
  }

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

  if (where.length > 0) {
    clauses.push(`where ${where.join(" & ")}`);
  }

  if (!name) {
    clauses.push("sort total_rating desc");
  }

  clauses.push(`limit ${limit}`, `offset ${offset}`);
  return `${clauses.join("; ")};`;
}

function normalizeGameCard(value: unknown) {
  const record = asRecord(value);

  return {
    igdbId: readPositiveInteger(record.id, "game ID"),
    imageUrl: readImageUrl(record.cover),
    name: readRequiredString(record.name, "game name"),
    platforms: readPlatforms(record.platforms),
    rating: readRating(record.total_rating),
    released: readReleaseDate(record.first_release_date),
  };
}

function normalizeGameDetail(value: unknown): IgdbGameDetail {
  const record = asRecord(value);

  return {
    ...normalizeGameCard(value),
    developers: readDevelopers(record.involved_companies),
    genres: readNamedValues(record.genres, "genre"),
    screenshots: readScreenshots(record.screenshots),
    summary: readNullableString(record.summary, "summary"),
  };
}

function normalizePlatform(value: unknown): Platform {
  const record = asRecord(value);

  return {
    id: readPositiveInteger(record.id, "platform ID"),
    name: readRequiredString(record.name, "platform name"),
  };
}

function readPlatforms(value: unknown): Platform[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw invalidResponse("platforms");
  }

  return value.map((item) => normalizePlatform(item));
}

function readNamedValues(value: unknown, label: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw invalidResponse(label);
  }

  return value.map((item) => readRequiredString(asRecord(item).name, label));
}

function readDevelopers(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw invalidResponse("developers");
  }

  return value.flatMap((item) => {
    const record = asRecord(item);

    if (record.developer !== true) {
      return [];
    }

    return [readRequiredString(asRecord(record.company).name, "developer")];
  });
}

function readScreenshots(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw invalidResponse("screenshots");
  }

  return value.map((item) => {
    const imageId = readRequiredString(asRecord(item).image_id, "screenshot");

    if (!isSafeImageId(imageId)) {
      throw invalidResponse("screenshot image");
    }

    return `https://images.igdb.com/igdb/image/upload/t_screenshot_med/${imageId}.jpg`;
  });
}

function readImageUrl(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const imageId = readRequiredString(asRecord(value).image_id, "cover image");

  if (!isSafeImageId(imageId)) {
    throw invalidResponse("cover image");
  }

  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;
}

function readRating(value: unknown): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {
    throw invalidResponse("rating");
  }

  return value;
}

function readReleaseDate(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw invalidResponse("release date");
  }

  return new Date(value * 1000).toISOString().slice(0, 10);
}

function readNullableString(value: unknown, label: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  return readRequiredString(value, label);
}

function readRequiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw invalidResponse(label);
  }

  return value;
}

function readPositiveInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw invalidResponse(label);
  }

  return value;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    throw invalidResponse("object");
  }

  return value as Record<string, unknown>;
}

function invalidResponse(label: string): IgdbClientError {
  return new IgdbClientError(
    "IGDB_INVALID_RESPONSE",
    `The IGDB ${label} is invalid.`,
  );
}

function toIgdbError(status: number): IgdbClientError {
  if (status === 401 || status === 403) {
    return new IgdbClientError(
      "IGDB_AUTH_FAILED",
      "The IGDB application token was rejected.",
    );
  }

  if (status === 429) {
    return new IgdbClientError(
      "IGDB_RATE_LIMITED",
      "The IGDB rate limit was reached.",
    );
  }

  if (status >= 500) {
    return new IgdbClientError(
      "IGDB_UNAVAILABLE",
      "The IGDB service is unavailable.",
    );
  }

  return new IgdbClientError(
    "IGDB_INVALID_RESPONSE",
    "The IGDB request was rejected.",
  );
}

function escapeSearchTerm(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function isSafeImageId(value: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(value);
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
