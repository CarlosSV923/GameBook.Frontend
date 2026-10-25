import type { FavoriteSnapshotUpdate } from "@/features/favorites/model/game";
import type { IgdbGameDetail } from "@/features/catalog/model/igdb";

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
