import axios from "axios";
import { describe, expect, it, vi } from "vitest";

import { requestJson } from "@/shared/api/http";

describe("requestJson", () => {
  it("retries transient GET failures before returning the response", async () => {
    const adapter = vi
      .fn()
      .mockResolvedValueOnce({
        config: {},
        data: null,
        headers: {},
        status: 503,
        statusText: "503",
      })
      .mockResolvedValueOnce({
        config: {},
        data: { ok: true },
        headers: { "content-type": "application/json" },
        status: 200,
        statusText: "200",
      });
    const httpClient = axios.create({ adapter });

    await expect(
      requestJson(httpClient, "https://game.example.test/health", {
        method: "GET",
      }),
    ).resolves.toEqual({ ok: true });
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it("does not retry mutations after a transient server failure", async () => {
    const adapter = vi.fn().mockResolvedValue({
      config: {},
      data: null,
      headers: {},
      status: 503,
      statusText: "503",
    });
    const httpClient = axios.create({ adapter });

    await expect(
      requestJson(httpClient, "https://game.example.test/v1/favorites", {
        method: "POST",
      }),
    ).rejects.toMatchObject({ status: 503 });
    expect(adapter).toHaveBeenCalledTimes(1);
  });
});
