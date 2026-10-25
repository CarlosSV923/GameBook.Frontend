import type { IgdbReleaseDatePrecision } from "@/features/catalog/model/igdb";

export function formatGameReleaseDate(
  released: string | null,
  precision: IgdbReleaseDatePrecision | null,
): string {
  if (!released) {
    return "—";
  }

  if (precision === "year") {
    return released.slice(0, 4);
  }

  if (precision === "month") {
    return released.slice(0, 7);
  }

  return released;
}
