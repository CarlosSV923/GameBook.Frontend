export type Platform = {
  id: number;
  name: string;
};

export type Favorite = {
  igdbId: number;
  imageUrl: string | null;
  name: string;
  platforms: Platform[];
  rating: number | null;
  released: string | null;
};

export type FavoritePage = {
  hasNext: boolean;
  items: Favorite[];
  page: number;
  pageSize: number;
  total: number;
};

export type FavoriteCreateInput = Omit<Favorite, "igdbId"> & {
  igdbId: number;
};

export type FavoriteSnapshotUpdate = Partial<
  Pick<Favorite, "imageUrl" | "name" | "platforms" | "rating" | "released">
>;

export type FavoriteFilters = {
  name?: string;
  page?: number;
  pageSize?: number;
  platformId?: number;
  yearFrom?: number;
  yearTo?: number;
};

export type SuggestionType = "name" | "platform";

export type FavoriteSuggestion = {
  platformId?: number;
  type: SuggestionType;
  value: string;
};

export type SuggestionPage = {
  items: FavoriteSuggestion[];
  query: string;
  type: SuggestionType;
};

export interface GameClient {
  createFavorite(token: string, input: FavoriteCreateInput): Promise<Favorite>;
  deleteFavorite(token: string, igdbId: number): Promise<void>;
  listFavorites(
    token: string,
    filters?: FavoriteFilters,
    signal?: AbortSignal,
  ): Promise<FavoritePage>;
  suggestFavorites(
    token: string,
    type: SuggestionType,
    query: string,
    limit?: number,
    signal?: AbortSignal,
  ): Promise<SuggestionPage>;
  updateFavoriteSnapshot(
    token: string,
    igdbId: number,
    input: FavoriteSnapshotUpdate,
  ): Promise<Favorite>;
}
