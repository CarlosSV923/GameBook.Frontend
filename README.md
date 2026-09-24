# GameBook.Frontend

[Read this README in Spanish](README.es.md)

`GameBook.Frontend` is the Next.js web application for GameBook, a portfolio project for exploring games and managing personal favorites.

## Responsibility

The frontend will provide public catalog and game-detail views, authenticated account and favorites experiences, and persistent light/dark theme and English/Spanish preferences. Its server-side code will query IGDB through Twitch application credentials without exposing them, and the browser will consume the AuthUser and Game services.

## Repository status

This repository contains the Next.js App Router foundation. Product features, visual tokens, provider adapters, and deployment are intentionally scheduled as later SDD tasks.

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
- `src/app/api/igdb/` and `src/app/api/twitch/` — reserved server-only routes; credentials never belong in client components.
- `src/features/` — product-facing UI and feature composition.
- `src/server/` — provider clients and server-only integration code.
- `src/shared/` — reusable, framework-aware primitives and shared contracts.

Runtime variable names are documented without values: `NEXT_PUBLIC_AUTHUSER_URL`, `NEXT_PUBLIC_GAME_URL`, `IGDB_CLIENT_ID`, and `IGDB_CLIENT_SECRET`.

## Related projects

- [GameBook.Microservice.AuthUser](https://github.com/CarlosSV923/GameBook.Microservice.AuthUser)
- [GameBook.Microservice.Game](https://github.com/CarlosSV923/GameBook.Microservice.Game)
