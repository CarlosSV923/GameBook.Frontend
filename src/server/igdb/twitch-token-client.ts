import "server-only";

import { readResponseBody, type Fetcher } from "@/shared/api/http";
import {
  IgdbClientError,
  type ApplicationTokenProvider,
} from "@/shared/api/igdb";
import type { IgdbRuntimeConfig } from "@/server/igdb/igdb-runtime-config";

export function createTwitchApplicationTokenProvider(
  config: IgdbRuntimeConfig,
  fetcher: Fetcher = fetch,
): ApplicationTokenProvider {
  let cachedToken: { accessToken: string; expiresAt: number } | null = null;

  return {
    async getToken(forceRefresh = false) {
      if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now()) {
        return cachedToken.accessToken;
      }

      let response: Response;

      try {
        response = await fetcher(config.twitchTokenUrl, {
          body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            grant_type: "client_credentials",
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        });
      } catch {
        throw new IgdbClientError(
          "IGDB_UNAVAILABLE",
          "The Twitch token service is unavailable.",
        );
      }

      let body: unknown;

      try {
        body = await readResponseBody(response);
      } catch {
        throw new IgdbClientError(
          "IGDB_AUTH_FAILED",
          "The Twitch application token response is invalid.",
        );
      }

      if (!response.ok || !isTwitchTokenResponse(body)) {
        throw new IgdbClientError(
          "IGDB_AUTH_FAILED",
          "The Twitch application token could not be obtained.",
        );
      }

      const expiresInSeconds = Math.max(5, body.expires_in - 60);
      cachedToken = {
        accessToken: body.access_token,
        expiresAt: Date.now() + expiresInSeconds * 1000,
      };

      return cachedToken.accessToken;
    },
  };
}

function isTwitchTokenResponse(
  value: unknown,
): value is { access_token: string; expires_in: number } {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.access_token === "string" &&
    value.access_token.length > 0 &&
    typeof value.expires_in === "number" &&
    Number.isFinite(value.expires_in) &&
    value.expires_in > 0
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
