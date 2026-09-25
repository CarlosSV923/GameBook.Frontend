import { describe, expect, it } from "vitest";

import {
  accessTokenStorageKey,
  clearAccessToken,
  readAccessToken,
  SessionStorageUnavailableError,
  writeAccessToken,
} from "@/shared/auth/session-storage";

function createStorage() {
  const values = new Map<string, string>();

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
    values,
  };
}

describe("auth session storage", () => {
  it("stores and reads only the opaque access token in the session storage key", () => {
    const storage = createStorage();

    writeAccessToken(" jwt-token ", storage);

    expect(storage.values).toEqual(
      new Map([[accessTokenStorageKey, "jwt-token"]]),
    );
    expect(readAccessToken(storage)).toBe("jwt-token");
  });

  it("clears the access token without affecting other session data", () => {
    const storage = createStorage();
    storage.setItem(accessTokenStorageKey, "jwt-token");
    storage.setItem("gamebook.catalog.filter", "platform");

    clearAccessToken(storage);

    expect(readAccessToken(storage)).toBeNull();
    expect(storage.getItem("gamebook.catalog.filter")).toBe("platform");
  });

  it("fails closed when session storage is unavailable for a new token", () => {
    expect(() => writeAccessToken("jwt-token", null)).toThrow(
      SessionStorageUnavailableError,
    );
  });
});
