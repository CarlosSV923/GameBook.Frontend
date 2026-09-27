import axios from "axios";
import { describe, expect, it, vi } from "vitest";

import {
  healthcheckMaxRetries,
  waitForServiceHealth,
} from "@/shared/api/healthcheck";

describe("service healthcheck", () => {
  it("retries only the health endpoint and proceeds after HTTP 200", async () => {
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
        data: null,
        headers: {},
        status: 502,
        statusText: "502",
      })
      .mockResolvedValueOnce({
        config: {},
        data: null,
        headers: {},
        status: 200,
        statusText: "200",
      });
    const httpClient = axios.create({ adapter });

    await expect(
      waitForServiceHealth("https://auth.example.test", undefined, httpClient),
    ).resolves.toBeUndefined();

    expect(adapter).toHaveBeenCalledTimes(3);
    expect(adapter.mock.calls[0][0].url).toBe(
      "https://auth.example.test/health",
    );
    expect(adapter.mock.calls[0][0].method).toBe("get");
    expect(adapter.mock.calls[0][0].timeout).toBe(15_000);
  });

  it("stops after the initial attempt plus 15 retries", async () => {
    const adapter = vi.fn().mockResolvedValue({
      config: {},
      data: null,
      headers: {},
      status: 503,
      statusText: "503",
    });
    const httpClient = axios.create({ adapter });

    await expect(
      waitForServiceHealth("https://game.example.test", undefined, httpClient),
    ).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE", status: 503 });

    expect(adapter).toHaveBeenCalledTimes(healthcheckMaxRetries + 1);
  });

  it("propagates caller cancellation without retrying", async () => {
    const controller = new AbortController();
    const adapter = vi.fn().mockImplementation(
      (config: { signal?: AbortSignal }) =>
        new Promise((_, reject) => {
          config.signal?.addEventListener("abort", () => {
            reject(new axios.CanceledError());
          });
        }),
    );
    const httpClient = axios.create({ adapter });

    const healthcheck = waitForServiceHealth(
      "https://game.example.test",
      controller.signal,
      httpClient,
    );
    controller.abort();

    await expect(healthcheck).rejects.toMatchObject({ name: "AbortError" });
    expect(adapter).toHaveBeenCalledTimes(1);
  });
});
