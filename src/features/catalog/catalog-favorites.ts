import type { GameClient } from "@/shared/api/game";

const ALL_FAVORITES_PAGE_SIZE = 1000;

export async function listAllFavoriteIds(
  gameClient: GameClient,
  token: string,
  signal?: AbortSignal,
): Promise<Set<number>> {
  const favoriteIds = new Set<number>();
  let page = 1;

  do {
    const response = await gameClient.listFavorites(
      token,
      { page, pageSize: ALL_FAVORITES_PAGE_SIZE },
      signal,
    );

    for (const favorite of response.items) {
      favoriteIds.add(favorite.igdbId);
    }

    page += 1;

    if (!response.hasNext) {
      break;
    }
  } while (!signal?.aborted);

  if (signal?.aborted) {
    throw new DOMException("The favorite lookup was aborted.", "AbortError");
  }

  return favoriteIds;
}
