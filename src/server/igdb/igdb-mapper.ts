import "server-only";

import { z } from "zod";

import type { Platform } from "@/features/favorites/model/game";
import {
  IgdbClientError,
  type IgdbGameCard,
  type IgdbGameDetail,
  type IgdbReleaseDatePrecision,
} from "@/features/catalog/model/igdb";

const recordSchema = z.record(z.string(), z.unknown());
const requiredStringSchema = z
  .string()
  .refine((value) => value.trim().length > 0);
const positiveIntegerSchema = z.number().int().min(1);
const nonnegativeNumberSchema = z.number().finite().nonnegative();
const ratingSchema = z.number().finite().min(0).max(100);
const imageIdSchema = requiredStringSchema.regex(/^[a-zA-Z0-9_-]+$/);
export function mapGameCard(value: unknown): IgdbGameCard {
  const record = parse(recordSchema, value, "object");

  return {
    igdbId: parse(positiveIntegerSchema, record.id, "game ID"),
    imageUrl: mapImageUrl(record.cover),
    name: parse(requiredStringSchema, record.name, "game name"),
    platforms: mapPlatforms(record.platforms),
    rating: mapNullable(record.total_rating, ratingSchema, "rating"),
    released: mapReleaseDate(record.first_release_date),
  };
}

export function isCompleteCatalogGame(game: IgdbGameCard): boolean {
  return (
    game.imageUrl !== null &&
    game.rating !== null &&
    game.released !== null &&
    game.platforms.length > 0
  );
}

export function mapGameDetail(value: unknown): IgdbGameDetail {
  const record = parse(recordSchema, value, "object");

  return {
    ...mapGameCard(value),
    developers: mapDevelopers(record.involved_companies),
    genres: mapNamedValues(record.genres, "genre"),
    releaseDatePrecision: mapReleaseDatePrecision(
      record.first_release_date,
      record.release_dates,
    ),
    screenshots: mapScreenshots(record.screenshots),
    summary: mapNullable(record.summary, requiredStringSchema, "summary"),
  };
}

export function mapPlatform(value: unknown): Platform {
  const record = parse(recordSchema, value, "object");

  return {
    id: parse(positiveIntegerSchema, record.id, "platform ID"),
    name: parse(requiredStringSchema, record.name, "platform name"),
  };
}

function mapPlatforms(value: unknown): Platform[] {
  if (value === undefined || value === null) {
    return [];
  }

  const platforms = parse(z.array(z.unknown()), value, "platforms");
  return platforms.map(mapPlatform);
}

function mapNamedValues(value: unknown, label: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  const items = parse(z.array(z.unknown()), value, label);
  return items.map((item) => {
    const record = parse(recordSchema, item, "object");
    return parse(requiredStringSchema, record.name, label);
  });
}

function mapDevelopers(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  const companies = parse(z.array(z.unknown()), value, "developers");
  return companies.flatMap((item) => {
    const record = parse(recordSchema, item, "object");

    if (record.developer !== true) {
      return [];
    }

    const company = parse(recordSchema, record.company, "object");
    return [parse(requiredStringSchema, company.name, "developer")];
  });
}

function mapScreenshots(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  const screenshots = parse(z.array(z.unknown()), value, "screenshots");
  return screenshots.map((item) => {
    const record = parse(recordSchema, item, "object");
    const imageId = parse(imageIdSchema, record.image_id, "screenshot image");
    return imageUrl("t_screenshot_med", imageId);
  });
}

function mapImageUrl(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const record = parse(recordSchema, value, "object");
  const imageId = parse(imageIdSchema, record.image_id, "cover image");
  return imageUrl("t_cover_big", imageId);
}

function mapReleaseDate(value: unknown): string | null {
  const timestamp = mapNullable(value, nonnegativeNumberSchema, "release date");
  return timestamp === null
    ? null
    : new Date(timestamp * 1000).toISOString().slice(0, 10);
}

function mapReleaseDatePrecision(
  firstReleaseDate: unknown,
  value: unknown,
): IgdbReleaseDatePrecision | null {
  if (firstReleaseDate === undefined || firstReleaseDate === null) {
    return null;
  }

  const firstDate = parse(
    nonnegativeNumberSchema,
    firstReleaseDate,
    "release date",
  );
  const releaseDates =
    value === undefined || value === null
      ? []
      : parse(z.array(z.unknown()), value, "release dates").map(
          mapReleaseDateParts,
        );
  const matchingRelease =
    releaseDates.find((releaseDate) => releaseDate.date === firstDate) ??
    releaseDates[0];

  if (
    matchingRelease?.d != null &&
    matchingRelease.m != null &&
    matchingRelease.y != null
  ) {
    return "day";
  }

  if (matchingRelease?.m != null && matchingRelease.y != null) {
    return "month";
  }

  return "year";
}

function mapReleaseDateParts(value: unknown) {
  const record = parse(recordSchema, value, "object");
  return {
    date: mapNullable(record.date, nonnegativeNumberSchema, "release date"),
    d: mapNullable(record.d, z.number().int().min(1).max(31), "release day"),
    m: mapNullable(record.m, z.number().int().min(1).max(12), "release month"),
    y: mapNullable(record.y, z.number().int().min(1).max(9999), "release year"),
  };
}

function mapNullable<T>(
  value: unknown,
  schema: z.ZodType<T>,
  label: string,
): T | null {
  return value === undefined || value === null
    ? null
    : parse(schema, value, label);
}

function parse<T>(schema: z.ZodType<T>, value: unknown, label: string): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw invalidResponse(label);
  }

  return result.data;
}

function imageUrl(size: "t_cover_big" | "t_screenshot_med", imageId: string) {
  return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
}

function invalidResponse(label: string): IgdbClientError {
  return new IgdbClientError(
    "IGDB_INVALID_RESPONSE",
    `The IGDB ${label} is invalid.`,
  );
}
