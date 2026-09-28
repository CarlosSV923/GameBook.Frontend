import { defer, EMPTY, firstValueFrom } from "rxjs";
import { expand, map, reduce } from "rxjs/operators";

import type { GameClient } from "@/shared/api/game";

const ALL_FAVORITES_PAGE_SIZE = 1000;

export async function listAllFavoriteIds(
  gameClient: GameClient,
  token: string,
  signal?: AbortSignal,
): Promise<Set<number>> {
  const requestPage = (page: number) => {
    if (signal?.aborted) {
      return Promise.reject(createAbortError());
    }

    return gameClient.listFavorites(
      token,
      { page, pageSize: ALL_FAVORITES_PAGE_SIZE },
      signal,
    );
  };

  return firstValueFrom(
    defer(() => requestPage(1)).pipe(
      expand(
        (response, pageIndex) =>
          response.hasNext ? defer(() => requestPage(pageIndex + 2)) : EMPTY,
        1,
      ),
      reduce((favoriteIds, response) => {
        for (const favorite of response.items) {
          favoriteIds.add(favorite.igdbId);
        }

        return favoriteIds;
      }, new Set<number>()),
      map((favoriteIds) => {
        if (signal?.aborted) {
          throw createAbortError();
        }

        return favoriteIds;
      }),
    ),
  );
}

function createAbortError(): DOMException {
  return new DOMException("The favorite lookup was aborted.", "AbortError");
}
