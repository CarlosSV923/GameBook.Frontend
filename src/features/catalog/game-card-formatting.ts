import type { Platform } from "@/shared/api/game";

export function formatGameRating(rating: number | null): string {
  return rating === null ? "—" : (Math.round(rating) / 10).toFixed(1);
}

export function formatGameYear(released: string | null): string {
  return released?.slice(0, 4) ?? "—";
}

export function formatGamePlatforms(platforms: readonly Platform[]): string {
  return platforms.length > 0
    ? platforms.map((platform) => platform.name).join(" · ")
    : "—";
}
