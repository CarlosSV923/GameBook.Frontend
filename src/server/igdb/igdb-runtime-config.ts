import "server-only";

import { IgdbClientError } from "@/shared/api/igdb";

export type IgdbRuntimeConfig = {
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  twitchTokenUrl: string;
};

export function getIgdbRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
): IgdbRuntimeConfig {
  const clientId = env.IGDB_CLIENT_ID?.trim();
  const clientSecret = env.IGDB_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new IgdbClientError(
      "IGDB_NOT_CONFIGURED",
      "IGDB server credentials are not configured.",
    );
  }

  return {
    apiBaseUrl: "https://api.igdb.com/v4",
    clientId,
    clientSecret,
    twitchTokenUrl: "https://id.twitch.tv/oauth2/token",
  };
}
