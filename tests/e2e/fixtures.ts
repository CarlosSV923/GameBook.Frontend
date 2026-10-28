import { expect, type Page, type Route } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

// Playwright loads these fixtures as CommonJS, so resolve from __dirname.
const covers = new Map(
  ["example", "lantern-tide", "paper-orbit", "quiet-archivist"].map((id) => [
    `${id}-cover`,
    readFileSync(path.join(__dirname, "assets", `${id}-cover.svg`)),
  ]),
);

const user = {
  id: "7b7f3d2e-6d8d-4e8c-9e0c-2a96f2fb11aa",
  fullName: "Ada Lovelace",
  email: "ada.lovelace@example.test",
};

export const exampleGame = {
  igdbId: 42,
  name: "Example Quest",
  released: "2015-06-12",
  imageUrl:
    "https://images.igdb.com/igdb/image/upload/t_cover_big/example-cover.jpg",
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

// Fictional first page; keep in sync with tests/e2e/fake-igdb-server.mjs.
export const catalogGames = [
  exampleGame,
  {
    igdbId: 43,
    name: "Lantern Tide",
    released: "2021-03-18",
    imageUrl:
      "https://images.igdb.com/igdb/image/upload/t_cover_big/lantern-tide-cover.jpg",
    rating: 89.6,
    platforms: [
      { id: 6, name: "PC" },
      { id: 130, name: "Nintendo Switch" },
      { id: 167, name: "PlayStation 5" },
      { id: 169, name: "Xbox Series X|S" },
    ],
  },
  {
    igdbId: 44,
    name: "Paper Orbit",
    released: "2018-09-04",
    imageUrl:
      "https://images.igdb.com/igdb/image/upload/t_cover_big/paper-orbit-cover.jpg",
    rating: 86.2,
    platforms: [
      { id: 6, name: "PC" },
      { id: 48, name: "PlayStation 4" },
    ],
  },
  {
    igdbId: 45,
    name: "The Quiet Archivist of Saltmarsh Hollow",
    released: "2012-11-20",
    imageUrl:
      "https://images.igdb.com/igdb/image/upload/t_cover_big/quiet-archivist-cover.jpg",
    rating: 81.4,
    platforms: [
      { id: 9, name: "PlayStation 3" },
      { id: 12, name: "Xbox 360" },
    ],
  },
];

type Favorite = typeof exampleGame;

export async function mockGameBook(
  page: Page,
  options: { catalogPagination?: boolean } = {},
) {
  const favorites: Favorite[] = [];
  const blockedRequests: string[] = [];

  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());

    if (url.origin === "http://127.0.0.1:3180") {
      // Serve covers locally so the image optimizer never fetches IGDB.
      if (url.pathname === "/_next/image") {
        const source = url.searchParams.get("url") ?? "";
        const coverId = source.match(/([a-z-]+-cover).jpg/)?.[1];
        await route.fulfill({
          contentType: "image/svg+xml",
          body: covers.get(coverId ?? "") ?? covers.get("example-cover"),
        });
        return;
      }
      if (url.pathname.startsWith("/api/igdb/")) {
        await fulfillIgdb(route, url, options.catalogPagination ?? false);
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

async function fulfillIgdb(route: Route, url: URL, catalogPagination: boolean) {
  if (url.pathname === "/api/igdb/games") {
    if (catalogPagination) {
      const offset = Number(url.searchParams.get("offset") ?? 0);
      const items = Array.from(
        { length: offset === 0 ? 20 : 1 },
        (_, index) => {
          const number = offset + index + 1;
          return {
            ...exampleGame,
            igdbId: 1000 + number,
            name: `Pagination Example ${number}`,
          };
        },
      );
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          hasNext: offset === 0,
          items,
          limit: 20,
          offset,
        }),
      });
      return;
    }
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        hasNext: false,
        items: catalogGames.filter((game) => matchesFilters(url, game)),
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
