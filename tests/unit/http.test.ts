import { describe, expect, it, vi } from "vitest";

import { requestJson } from "@/shared/api/http";

describe("requestJson", () => {
  it("retries transient GET failures before returning the response", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
      );

    await expect(
      requestJson(fetcher, "https://game.example.test/health", {
        method: "GET",
      }),
    ).resolves.toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("does not retry mutations after a transient server failure", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 503 }));

    await expect(
      requestJson(fetcher, "https://game.example.test/v1/favorites", {
        method: "POST",
      }),
    ).rejects.toMatchObject({ status: 503 });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
