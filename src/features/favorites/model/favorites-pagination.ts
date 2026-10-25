import type { FavoritePage } from "@/features/favorites/model/game";

export function getNextFavoritePage(page: FavoritePage): number {
  return page.page + 1;
}
