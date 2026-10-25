import type { Platform } from "@/features/favorites/model/game";

export function formatGameRating(rating: number | null): string {
  return rating === null ? "—" : String(Math.round(rating));
}

export function formatGameYear(released: string | null): string {
  return released?.slice(0, 4) ?? "—";
}

export function formatGamePlatforms(platforms: readonly Platform[]): string {
  return platforms.length > 0
    ? platforms.map((platform) => platform.name).join(" · ")
    : "—";
}
