import { describe, expect, it } from "vitest";

import { createAuthUserClient } from "@/features/api/auth-user-client";
import { createGameClient } from "@/features/api/game-client";
import { createMockFetcher } from "@/shared/api/mocks";

describe("AuthUser client", () => {
  it("keeps public calls unauthenticated and sends Bearer only to protected calls", async () => {
    const { fetcher, requests } = createMockFetcher([
      { body: { status: "ok" } },
      {
        body: {
          user: { email: "user@example.com", fullName: "Ada", id: "user-1" },
        },
      },
      { body: { status: "ok" } },
      {
        body: {
          accessToken: "jwt-token",
          expiresIn: 3600,
          tokenType: "Bearer",
          user: { email: "user@example.com", fullName: "Ada", id: "user-1" },
        },
      },
      { body: { status: "ok" } },
      {
        body: {
          user: { email: "user@example.com", fullName: "Ada", id: "user-1" },
        },
      },
      { body: { status: "ok" } },
      { status: 204 },
      { body: { status: "ok" } },
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
    await client.disableMyAccount("jwt-token");

    expect(requests).toHaveLength(10);
    expect(requests.filter(({ url }) => url.endsWith("/health"))).toHaveLength(
      5,
    );
    const serviceRequests = requests.filter(
      ({ url }) => !url.endsWith("/health"),
    );
    expect(serviceRequests[0].url).toBe(
      "https://auth.example.test/v1/auth/register",
    );
    expect(serviceRequests[0].headers.get("authorization")).toBeNull();
    expect(serviceRequests[1].headers.get("authorization")).toBeNull();
    expect(serviceRequests[2].headers.get("authorization")).toBe(
      "Bearer jwt-token",
    );
    expect(serviceRequests[3].headers.get("authorization")).toBe(
      "Bearer jwt-token",
    );
    expect(serviceRequests[3].method).toBe("PATCH");
    expect(serviceRequests[4].headers.get("authorization")).toBe(
      "Bearer jwt-token",
    );
    expect(serviceRequests[4].method).toBe("DELETE");
    expect(serviceRequests[4].url).toBe(
      "https://auth.example.test/v1/users/me",
    );
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
      { body: { status: "ok" } },
      {
        body: {
          hasNext: false,
          items: [favorite],
          page: 2,
          pageSize: 10,
          total: 1,
        },
      },
      { body: { status: "ok" } },
      { body: favorite },
      { body: { status: "ok" } },
      { body: { items: [], query: "pla", type: "platform" } },
      { body: { status: "ok" } },
      { body: favorite },
      { body: { status: "ok" } },
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

    expect(requests).toHaveLength(10);
    expect(requests.filter(({ url }) => url.endsWith("/health"))).toHaveLength(
      5,
    );
    const serviceRequests = requests.filter(
      ({ url }) => !url.endsWith("/health"),
    );
    for (const request of serviceRequests) {
      expect(request.headers.get("authorization")).toBe("Bearer jwt-token");
    }

    expect(
      serviceRequests.every((request) => !request.url.includes("userId")),
    ).toBe(true);

    const listUrl = new URL(serviceRequests[0].url);
    expect(listUrl.pathname).toBe("/v1/favorites");
    expect(listUrl.searchParams.get("platformId")).toBe("6");
    expect(listUrl.searchParams.get("yearFrom")).toBe("2020");
    expect(listUrl.searchParams.get("yearTo")).toBe("2024");
    expect(serviceRequests[1].method).toBe("POST");
    expect(serviceRequests[2].url).toContain("type=platform");
    expect(serviceRequests[2].url).toContain("limit=5");
    expect(serviceRequests[3].url).toBe(
      "https://game.example.test/v1/favorites/42/snapshot",
    );
    expect(serviceRequests[4].method).toBe("DELETE");
  });

  it("notifies the session owner when a protected request returns 401", async () => {
    const { fetcher } = createMockFetcher([
      { body: { status: "ok" } },
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
