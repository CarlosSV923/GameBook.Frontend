import { createServer } from "node:http";

const port = Number(process.env.FAKE_IGDB_PORT ?? 3181);
const game = {
  cover: { image_id: "example-cover" },
  first_release_date: 1434067200,
  id: 42,
  name: "Example Quest",
  platforms: [{ id: 6, name: "PC" }],
  total_rating: 92.4,
};
// Fictional first page; keep in sync with catalogGames in fixtures.ts.
const catalog = [
  game,
  {
    cover: { image_id: "lantern-tide-cover" },
    first_release_date: 1616025600,
    id: 43,
    name: "Lantern Tide",
    platforms: [
      { id: 6, name: "PC" },
      { id: 130, name: "Nintendo Switch" },
      { id: 167, name: "PlayStation 5" },
      { id: 169, name: "Xbox Series X|S" },
    ],
    total_rating: 89.6,
  },
  {
    cover: { image_id: "paper-orbit-cover" },
    first_release_date: 1536019200,
    id: 44,
    name: "Paper Orbit",
    platforms: [
      { id: 6, name: "PC" },
      { id: 48, name: "PlayStation 4" },
    ],
    total_rating: 86.2,
  },
  {
    cover: { image_id: "quiet-archivist-cover" },
    first_release_date: 1353369600,
    id: 45,
    name: "The Quiet Archivist of Saltmarsh Hollow",
    platforms: [
      { id: 9, name: "PlayStation 3" },
      { id: 12, name: "Xbox 360" },
    ],
    total_rating: 81.4,
  },
];

createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  let body = "";
  for await (const chunk of request) body += chunk;

  response.setHeader("Content-Type", "application/json");
  if (url.pathname === "/health") {
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }
  if (url.pathname === "/oauth2/token" && request.method === "POST") {
    response.end(
      JSON.stringify({ access_token: "fake-token", expires_in: 3600 }),
    );
    return;
  }
  if (url.pathname === "/v4/games" && request.method === "POST") {
    response.end(JSON.stringify(body.includes("search ") ? [game] : catalog));
    return;
  }
  if (url.pathname === "/v4/platforms" && request.method === "POST") {
    response.end(JSON.stringify([{ id: 6, name: "PC" }]));
    return;
  }
  response.writeHead(404).end(JSON.stringify({ error: "not found" }));
}).listen(port, "127.0.0.1");
