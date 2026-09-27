import { describe, expect, it } from "vitest";

import { shouldDiscardToken } from "@/features/auth/auth-provider";
import { ApiClientError } from "@/shared/api/http";

describe("shouldDiscardToken", () => {
  it("keeps the session for an invalid current password", () => {
    const error = new ApiClientError(401, {
      code: "INVALID_CREDENTIALS",
    });

    expect(shouldDiscardToken(error)).toBe(false);
  });

  it("discards the session for authentication failures", () => {
    for (const code of [
      "TOKEN_INVALID",
      "TOKEN_EXPIRED",
      "SESSION_REVOKED",
      "ACCOUNT_DISABLED",
    ]) {
      expect(shouldDiscardToken(new ApiClientError(401, { code }))).toBe(true);
    }
  });

  it("does not discard the session for unrelated errors", () => {
    expect(
      shouldDiscardToken(new ApiClientError(500, { code: "SERVER_ERROR" })),
    ).toBe(false);
    expect(shouldDiscardToken(new Error("network failure"))).toBe(false);
  });
});
