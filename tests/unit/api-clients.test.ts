import { describe, expect, it } from "vitest";

import { createAuthUserClient } from "@/features/api/auth-user-client";
import { createGameClient } from "@/features/api/game-client";
import { createMockFetcher } from "@/shared/api/mocks";

describe("AuthUser client", () => {
  it("keeps public calls unauthenticated and sends Bearer only to protected calls", async () => {
    const { fetcher, requests } = createMockFetcher([
      {
        body: {
          user: { email: "user@example.com", fullName: "Ada", id: "user-1" },
        },
      },
      {
        body: {
          accessToken: "jwt-token",
          expiresIn: 3600,
          tokenType: "Bearer",
          user: { email: "user@example.com", fullName: "Ada", id: "user-1" },
        },
      },
      {
        body: {
          user: { email: "user@example.com", fullName: "Ada", id: "user-1" },
        },
      },
      { status: 204 },
    ]);
    const client = createAuthUserClient({
      baseUrl: "https://auth.example.test/",
      fetcher,
    });

    await client.register({
      email: "user@example.com",
      fullName: "Ada",
      password: "correct-horse",
      passwordConfirmation: "correct-horse",
    });
    await client.login({
      email: "user@example.com",
      password: "correct-horse",
    });
    await client.getCurrentSession("jwt-token");
    await client.changeMyPassword("jwt-token", {
      currentPassword: "correct-horse",
      newPassword: "new-correct-horse",
    });

    expect(requests).toHaveLength(4);
    expect(requests[0].url).toBe("https://auth.example.test/v1/auth/register");
    expect(requests[0].headers.get("authorization")).toBeNull();
    expect(requests[1].headers.get("authorization")).toBeNull();
    expect(requests[2].headers.get("authorization")).toBe("Bearer jwt-token");
    expect(requests[3].headers.get("authorization")).toBe("Bearer jwt-token");
    expect(requests[3].method).toBe("PATCH");
  });
});

describe("Game client", () => {
  it("adds the JWT to every protected operation and preserves contract query parameters", async () => {
    const favorite = {
      igdbId: 42,
      imageUrl: null,
      name: "Game",
      platforms: [],
      rating: 88,
      released: "2024-01-01",
    };
    const { fetcher, requests } = createMockFetcher([
      {
        body: {
          hasNext: false,
          items: [favorite],
          page: 2,
          pageSize: 10,
          total: 1,
        },
      },
      { body: favorite },
      { body: { items: [], query: "pla", type: "platform" } },
      { body: favorite },
      { status: 204 },
    ]);
    const client = createGameClient({
      baseUrl: "https://game.example.test",
      fetcher,
    });

    await client.listFavorites("jwt-token", {
      name: "Game",
      page: 2,
      pageSize: 10,
      platformId: 6,
      yearFrom: 2020,
      yearTo: 2024,
    });
    await client.createFavorite("jwt-token", favorite);
    await client.suggestFavorites("jwt-token", "platform", "pla", 5);
    await client.updateFavoriteSnapshot("jwt-token", 42, { rating: 90 });
    await client.deleteFavorite("jwt-token", 42);

    expect(requests).toHaveLength(5);
    for (const request of requests) {
      expect(request.headers.get("authorization")).toBe("Bearer jwt-token");
    }

    expect(requests.every((request) => !request.url.includes("userId"))).toBe(
      true,
    );

    const listUrl = new URL(requests[0].url);
    expect(listUrl.pathname).toBe("/v1/favorites");
    expect(listUrl.searchParams.get("platformId")).toBe("6");
    expect(listUrl.searchParams.get("yearFrom")).toBe("2020");
    expect(listUrl.searchParams.get("yearTo")).toBe("2024");
    expect(requests[1].method).toBe("POST");
    expect(requests[2].url).toContain("type=platform");
    expect(requests[2].url).toContain("limit=5");
    expect(requests[3].url).toBe(
      "https://game.example.test/v1/favorites/42/snapshot",
    );
    expect(requests[4].method).toBe("DELETE");
  });

  it("notifies the session owner when a protected request returns 401", async () => {
    const { fetcher } = createMockFetcher([
      {
        body: {
          code: "TOKEN_EXPIRED",
          message: "Authentication is no longer valid.",
        },
        status: 401,
      },
    ]);
    let unauthorizedCalls = 0;
    const client = createGameClient({
      baseUrl: "https://game.example.test",
      fetcher,
      onUnauthorized: () => {
        unauthorizedCalls += 1;
      },
    });

    await expect(client.listFavorites("jwt-token")).rejects.toMatchObject({
      code: "TOKEN_EXPIRED",
      status: 401,
    });
    expect(unauthorizedCalls).toBe(1);
  });
});
