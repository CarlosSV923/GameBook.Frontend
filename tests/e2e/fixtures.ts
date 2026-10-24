import { expect, type Page, type Route } from "@playwright/test";

const user = {
  id: "7b7f3d2e-6d8d-4e8c-9e0c-2a96f2fb11aa",
  fullName: "Ada Lovelace",
  email: "ada.lovelace@example.test",
};

export const exampleGame = {
  igdbId: 42,
  name: "Example Quest",
  released: "2015-06-12",
  imageUrl: null,
  rating: 92.4,
  platforms: [{ id: 6, name: "PC" }],
};

const detail = {
  ...exampleGame,
  developers: ["Fictional Studio"],
  genres: ["Adventure"],
  releaseDatePrecision: "day",
  screenshots: [],
  summary: "A fictional game fixture for browser tests.",
};

type Favorite = typeof exampleGame;

export async function mockGameBook(page: Page) {
  const favorites: Favorite[] = [];
  const blockedRequests: string[] = [];

  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());

    if (url.origin === "http://127.0.0.1:3180") {
      if (url.pathname.startsWith("/api/igdb/")) {
        await fulfillIgdb(route, url);
        return;
      }
      await route.continue();
      return;
    }

    if (url.origin === "https://authuser.example.test") {
      await fulfillAuthUser(route, url);
      return;
    }

    if (url.origin === "https://game.example.test") {
      await fulfillGame(route, url, favorites);
      return;
    }

    blockedRequests.push(url.href);
    await route.abort("blockedbyclient");
  });

  return {
    expectNoExternalRequests: async () => {
      expect(blockedRequests).toEqual([]);
    },
  };
}

async function fulfillIgdb(route: Route, url: URL) {
  if (url.pathname === "/api/igdb/games") {
    const gameMatches = matchesFilters(url, exampleGame);
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        hasNext: false,
        items: gameMatches ? [exampleGame] : [],
        limit: Number(url.searchParams.get("limit") ?? 20),
        offset: Number(url.searchParams.get("offset") ?? 0),
      }),
    });
    return;
  }

  if (url.pathname === "/api/igdb/platforms") {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([{ id: 6, name: "PC" }]),
    });
    return;
  }

  if (url.pathname === "/api/igdb/games/suggestions") {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([{ igdbId: 42, name: "Example Quest" }]),
    });
    return;
  }

  if (url.pathname === "/api/igdb/games/42") {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(detail),
    });
    return;
  }

  await route.fulfill({
    status: 404,
    contentType: "application/json",
    body: "{}",
  });
}

async function fulfillAuthUser(route: Route, url: URL) {
  const cors = corsHeaders(route.request().headers().origin);
  const method = route.request().method();
  if (method === "OPTIONS") {
    await route.fulfill({ status: 204, headers: cors });
    return;
  }

  if (url.pathname === "/health") {
    await route.fulfill({
      status: 200,
      headers: cors,
      contentType: "application/json",
      body: JSON.stringify({ status: "ok" }),
    });
    return;
  }

  if (url.pathname === "/v1/auth/register" && method === "POST") {
    await route.fulfill({
      status: 201,
      headers: cors,
      contentType: "application/json",
      body: JSON.stringify({ user }),
    });
    return;
  }

  if (url.pathname === "/v1/auth/login" && method === "POST") {
    await route.fulfill({
      status: 200,
      headers: cors,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken: "fictional-e2e-token",
        expiresIn: 3600,
        tokenType: "Bearer",
        user,
      }),
    });
    return;
  }

  if (url.pathname === "/v1/auth/session" && method === "GET") {
    await route.fulfill({
      status: 200,
      headers: cors,
      contentType: "application/json",
      body: JSON.stringify({ user }),
    });
    return;
  }

  await route.fulfill({
    status: 404,
    headers: cors,
    contentType: "application/json",
    body: JSON.stringify({ code: "NOT_FOUND", message: "Not found." }),
  });
}

async function fulfillGame(route: Route, url: URL, favorites: Favorite[]) {
  const cors = corsHeaders(route.request().headers().origin);
  const method = route.request().method();
  if (method === "OPTIONS") {
    await route.fulfill({ status: 204, headers: cors });
    return;
  }

  if (url.pathname === "/health") {
    await route.fulfill({
      status: 200,
      headers: cors,
      contentType: "application/json",
      body: JSON.stringify({ status: "ok" }),
    });
    return;
  }

  if (url.pathname === "/v1/favorites" && method === "GET") {
    const items = favorites.filter((favorite) => matchesFilters(url, favorite));
    await route.fulfill({
      status: 200,
      headers: cors,
      contentType: "application/json",
      body: JSON.stringify({
        items,
        page: Number(url.searchParams.get("page") ?? 1),
        pageSize: 20,
        total: items.length,
        hasNext: false,
      }),
    });
    return;
  }

  if (url.pathname === "/v1/favorites" && method === "POST") {
    const favorite = route.request().postDataJSON() as Favorite;
    favorites.push(favorite);
    await route.fulfill({
      status: 201,
      headers: cors,
      contentType: "application/json",
      body: JSON.stringify(favorite),
    });
    return;
  }

  if (url.pathname === "/v1/favorites/suggestions") {
    const type = url.searchParams.get("type") ?? "name";
    const suggestion =
      type === "platform"
        ? { type, value: "PC", platformId: 6 }
        : { type, value: "Example Quest" };
    await route.fulfill({
      status: 200,
      headers: cors,
      contentType: "application/json",
      body: JSON.stringify({
        type,
        query: url.searchParams.get("q"),
        items: [suggestion],
      }),
    });
    return;
  }

  const snapshotMatch = url.pathname.match(
    /^\/v1\/favorites\/(\d+)\/snapshot$/,
  );
  if (snapshotMatch && method === "PATCH") {
    const favorite = favorites.find(
      (item) => item.igdbId === Number(snapshotMatch[1]),
    );
    if (favorite) Object.assign(favorite, route.request().postDataJSON());
    await route.fulfill({
      status: favorite ? 200 : 404,
      headers: cors,
      contentType: "application/json",
      body: JSON.stringify(favorite ?? {}),
    });
    return;
  }

  const deleteMatch = url.pathname.match(/^\/v1\/favorites\/(\d+)$/);
  if (deleteMatch && method === "DELETE") {
    const index = favorites.findIndex(
      (item) => item.igdbId === Number(deleteMatch[1]),
    );
    if (index >= 0) favorites.splice(index, 1);
    await route.fulfill({
      status: index >= 0 ? 204 : 404,
      headers: cors,
      body: "",
    });
    return;
  }

  await route.fulfill({
    status: 404,
    headers: cors,
    contentType: "application/json",
    body: JSON.stringify({ code: "NOT_FOUND", message: "Not found." }),
  });
}

function matchesFilters(url: URL, game: Favorite) {
  const name = url.searchParams.get("name")?.toLowerCase();
  const platformId = url.searchParams.get("platformId");
  const year = Number(game.released.slice(0, 4));
  const yearFrom = Number(url.searchParams.get("yearFrom") ?? 0);
  const yearTo = Number(url.searchParams.get("yearTo") ?? 9999);

  return (
    (!name || game.name.toLowerCase().includes(name)) &&
    (!platformId ||
      game.platforms.some((platform) => platform.id === Number(platformId))) &&
    year >= yearFrom &&
    year <= yearTo
  );
}

function corsHeaders(origin?: string) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  };
}
