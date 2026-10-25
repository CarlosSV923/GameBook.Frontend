import { describe, expect, it } from "vitest";

import {
  getIgdbRuntimeConfig,
  getLocalhostOverride,
} from "@/server/igdb/igdb-runtime-config";

describe("IGDB runtime URL overrides", () => {
  it.each(["http://127.0.0.1:3181/v4", "https://localhost:3181/v4"])(
    "accepts local HTTP(S) URL %s",
    (value) => {
      expect(getLocalhostOverride(value)).toBe(value);
    },
  );

  it.each([
    "https://api.igdb.com/v4",
    "http://localhost.example.test/v4",
    "http://127.0.0.2:3181/v4",
    "file://localhost/v4",
    "not a URL",
  ])("rejects non-local URL %s", (value) => {
    expect(getLocalhostOverride(value)).toBeUndefined();
  });

  it("uses accepted overrides and keeps production defaults otherwise", () => {
    const credentials = {
      NODE_ENV: "test",
      IGDB_CLIENT_ID: "fake-id",
      IGDB_CLIENT_SECRET: "fake-secret",
    };

    expect(
      getIgdbRuntimeConfig({
        ...credentials,
        IGDB_API_BASE_URL: "http://127.0.0.1:3181/v4",
        TWITCH_TOKEN_URL: "http://localhost:3181/oauth2/token",
      } as NodeJS.ProcessEnv),
    ).toMatchObject({
      apiBaseUrl: "http://127.0.0.1:3181/v4",
      twitchTokenUrl: "http://localhost:3181/oauth2/token",
    });

    expect(
      getIgdbRuntimeConfig(credentials as NodeJS.ProcessEnv),
    ).toMatchObject({
      apiBaseUrl: "https://api.igdb.com/v4",
      twitchTokenUrl: "https://id.twitch.tv/oauth2/token",
    });
  });
});
