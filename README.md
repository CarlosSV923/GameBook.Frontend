# GameBook.Frontend

[Read this README in Spanish](README.es.md)

`GameBook.Frontend` is the Next.js web application for GameBook, a portfolio project for exploring games and managing personal favorites.

## Responsibility

The frontend will provide public catalog and game-detail views, authenticated account and favorites experiences, and persistent light/dark theme and English/Spanish preferences. Its server-side code will query IGDB through Twitch application credentials without exposing them, and the browser will consume the AuthUser and Game services.

## Repository status

This repository contains the Next.js App Router foundation, the first visual system, and the server-only IGDB provider adapter. Product views, authenticated experiences, and deployment remain scheduled as later SDD tasks.

## Local development

```bash
pnpm install
pnpm dev
```

Quality checks:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

## Structure

- `src/app/` — App Router shell and server route boundaries.
- `src/app/api/igdb/` — server-only IGDB proxy routes for catalog, game detail, and suggestions; credentials never belong in client components.
- `src/app/api/twitch/` — reserved server-only routes for future Twitch concerns.
- `src/features/` — product-facing UI and feature composition.
- `src/server/` — provider clients and server-only integration code.
- `src/shared/` — reusable, framework-aware primitives and shared contracts.

Visual preferences are available without an account: the theme follows the system on first visit, manual light/dark choices persist under `gamebook.theme`, and English/Spanish choices persist under `gamebook.language`.

Runtime variable names are documented without values: `NEXT_PUBLIC_AUTHUSER_URL`, `NEXT_PUBLIC_GAME_URL`, `IGDB_CLIENT_ID`, and `IGDB_CLIENT_SECRET`.

The public browser talks only to the frontend proxy: `GET /api/igdb/games`, `GET /api/igdb/games/:igdbId`, `GET /api/igdb/games/suggestions?query=...`, and `GET /api/igdb/platforms?query=...`. The proxy obtains and renews the Twitch application token on the server, uses fixed IGDB endpoints, and applies the contract limits of four requests per second and eight concurrent requests.

## Related projects

- [GameBook.Microservice.AuthUser](https://github.com/CarlosSV923/GameBook.Microservice.AuthUser)
- [GameBook.Microservice.Game](https://github.com/CarlosSV923/GameBook.Microservice.Game)
