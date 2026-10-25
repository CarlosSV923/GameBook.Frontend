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
    response.end(JSON.stringify(body.includes("search ") ? [game] : [game]));
    return;
  }
  if (url.pathname === "/v4/platforms" && request.method === "POST") {
    response.end(JSON.stringify([{ id: 6, name: "PC" }]));
    return;
  }
  response.writeHead(404).end(JSON.stringify({ error: "not found" }));
}).listen(port, "127.0.0.1");
