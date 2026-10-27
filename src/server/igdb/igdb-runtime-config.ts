import "server-only";

import { IgdbClientError } from "@/features/catalog/model/igdb";

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
    apiBaseUrl:
      getLocalhostOverride(env.IGDB_API_BASE_URL) ?? "https://api.igdb.com/v4",
    clientId,
    clientSecret,
    twitchTokenUrl:
      getLocalhostOverride(env.TWITCH_TOKEN_URL) ??
      "https://id.twitch.tv/oauth2/token",
  };
}

export function getLocalhostOverride(value?: string): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (
      (url.protocol === "http:" || url.protocol === "https:") &&
      (url.hostname === "127.0.0.1" || url.hostname === "localhost")
    ) {
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    return undefined;
  }

  return undefined;
}
