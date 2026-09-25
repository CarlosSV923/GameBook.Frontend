import type { FavoritePage } from "@/shared/api/game";

export function getNextFavoritePage(page: FavoritePage): number {
  return page.page + 1;
}
