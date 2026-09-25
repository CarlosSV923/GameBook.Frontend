export const accessTokenStorageKey = "gamebook.auth.access-token";

type StorageLike = Pick<Storage, "getItem" | "removeItem" | "setItem">;

export class SessionStorageUnavailableError extends Error {
  constructor() {
    super("Session storage is unavailable.");
    this.name = "SessionStorageUnavailableError";
  }
}

export function readAccessToken(storage = getSessionStorage()): string | null {
  if (!storage) {
    return null;
  }

  try {
    const token = storage.getItem(accessTokenStorageKey)?.trim();
    return token || null;
  } catch {
    return null;
  }
}

export function writeAccessToken(
  token: string,
  storage = getSessionStorage(),
): void {
  if (!token.trim()) {
    throw new Error("An access token is required.");
  }

  if (!storage) {
    throw new SessionStorageUnavailableError();
  }

  try {
    storage.setItem(accessTokenStorageKey, token.trim());
  } catch {
    throw new SessionStorageUnavailableError();
  }
}

export function clearAccessToken(storage = getSessionStorage()): void {
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(accessTokenStorageKey);
  } catch {
    // Clearing an unavailable browser storage is already best effort.
  }
}

function getSessionStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
