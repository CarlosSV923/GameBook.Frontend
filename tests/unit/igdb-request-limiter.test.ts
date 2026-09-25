import { describe, expect, it } from "vitest";

import {
  createIgdbRequestLimiter,
  IGDB_MAX_CONCURRENT_REQUESTS,
  IGDB_MAX_REQUESTS_PER_SECOND,
} from "@/server/igdb/igdb-request-limiter";

describe("IGDB request limiter", () => {
  it("uses the contract limits by default", () => {
    expect(IGDB_MAX_REQUESTS_PER_SECOND).toBe(4);
    expect(IGDB_MAX_CONCURRENT_REQUESTS).toBe(8);
  });

  it("does not exceed the configured concurrent request count", async () => {
    const limiter = createIgdbRequestLimiter({
      maxConcurrent: 2,
      maxPerSecond: 100,
    });
    let active = 0;
    let peak = 0;

    const results = await Promise.all(
      Array.from({ length: 5 }, (_, index) =>
        limiter.schedule(async () => {
          active += 1;
          peak = Math.max(peak, active);
          await new Promise((resolve) => setTimeout(resolve, 10));
          active -= 1;
          return index;
        }),
      ),
    );

    expect(results).toEqual([0, 1, 2, 3, 4]);
    expect(peak).toBe(2);
  });
});
