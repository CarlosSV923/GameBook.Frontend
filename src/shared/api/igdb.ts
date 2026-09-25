import type { Platform } from "@/shared/api/game";

export type IgdbCatalogFilters = {
  limit?: number;
  name?: string;
  offset?: number;
  platformId?: number;
  yearFrom?: number;
  yearTo?: number;
};

export type IgdbGameCard = {
  igdbId: number;
  imageUrl: string | null;
  name: string;
  platforms: Platform[];
  rating: number | null;
  released: string | null;
};

export type IgdbCatalogPage = {
  hasNext: boolean;
  items: IgdbGameCard[];
  limit: number;
  offset: number;
};

export type IgdbGameDetail = IgdbGameCard & {
  developers: string[];
  genres: string[];
  screenshots: string[];
  summary: string | null;
};

export type IgdbGameSuggestion = {
  igdbId: number;
  name: string;
};

export type IgdbPlatformSuggestion = Platform;

export type IgdbErrorCode =
  | "IGDB_AUTH_FAILED"
  | "IGDB_INVALID_RESPONSE"
  | "IGDB_NOT_CONFIGURED"
  | "IGDB_RATE_LIMITED"
  | "IGDB_UNAVAILABLE";

export class IgdbClientError extends Error {
  readonly code: IgdbErrorCode;

  constructor(code: IgdbErrorCode, message: string) {
    super(message);
    this.name = "IgdbClientError";
    this.code = code;
  }
}

export interface IgdbClient {
  getCatalog(filters?: IgdbCatalogFilters): Promise<IgdbCatalogPage>;
  getGameDetail(igdbId: number): Promise<IgdbGameDetail | null>;
  getGameSuggestions(query: string): Promise<IgdbGameSuggestion[]>;
  getPlatformSuggestions(query: string): Promise<IgdbPlatformSuggestion[]>;
}

export interface ApplicationTokenProvider {
  getToken(forceRefresh?: boolean): Promise<string>;
}
