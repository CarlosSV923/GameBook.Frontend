import type { FavoriteSnapshotUpdate } from "@/shared/api/game";
import type { IgdbGameDetail } from "@/shared/api/igdb";

export function toFavoriteSnapshot(
  detail: Pick<
    IgdbGameDetail,
    "imageUrl" | "name" | "platforms" | "rating" | "released"
  >,
): FavoriteSnapshotUpdate {
  return {
    imageUrl: detail.imageUrl,
    name: detail.name,
    platforms: detail.platforms,
    rating: detail.rating,
    released: detail.released,
  };
}
