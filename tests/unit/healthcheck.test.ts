import { describe, expect, it, vi } from "vitest";

import {
  healthcheckMaxRetries,
  waitForServiceHealth,
} from "@/shared/api/healthcheck";

describe("service healthcheck", () => {
  it("retries only the health endpoint and proceeds after HTTP 200", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 502 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    await expect(
      waitForServiceHealth(fetcher, "https://auth.example.test"),
    ).resolves.toBeUndefined();

    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher).toHaveBeenCalledWith(
      "https://auth.example.test/health",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("stops after the initial attempt plus 15 retries", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 503 }));

    await expect(
      waitForServiceHealth(fetcher, "https://game.example.test"),
    ).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE", status: 503 });

    expect(fetcher).toHaveBeenCalledTimes(healthcheckMaxRetries + 1);
  });
});
