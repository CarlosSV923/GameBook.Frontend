# GameBook.Frontend

[Read this README in Spanish](README.es.md)

`GameBook.Frontend` is the Next.js web application for GameBook, a portfolio project for exploring games and managing personal favorites.

## Responsibility

The frontend will provide public catalog and game-detail views, authenticated account and favorites experiences, and persistent light/dark theme and English/Spanish preferences. Its server-side code will query IGDB through Twitch application credentials without exposing them, and the browser will consume the AuthUser and Game services.

## Repository status

This repository contains the Next.js App Router foundation, the first visual system, the server-only IGDB provider adapter, and the initial public catalog card view. Filters, detail, authenticated experiences, and deployment remain scheduled as later SDD tasks.

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

### Local AuthUser integration

Run `GameBook.Microservice.AuthUser` on `http://localhost:3001` and allow the
exact Frontend origin with `CORS_ALLOWED_ORIGINS=http://localhost:3000`. Add the
following ignored local variable to `.env`:

```bash
NEXT_PUBLIC_AUTHUSER_URL=http://localhost:3001
```

Restart the Next.js development server after changing a `NEXT_PUBLIC_` variable.
The Frontend then supports the local register, login, session, profile and
password-revocation flow without exposing AuthUser secrets.

### Local Game integration

Run `GameBook.Microservice.Game` on `http://localhost:3002`, configure its
ignored `.env` with `AUTHUSER_URL=http://localhost:3001` and the exact browser
origin `CORS_ALLOWED_ORIGINS=http://localhost:3000`, then add the following
ignored Frontend variable:

```bash
NEXT_PUBLIC_GAME_URL=http://localhost:3002
```

Restart the Next.js development server after changing `NEXT_PUBLIC_GAME_URL`.
The authenticated favorites view then sends the same AuthUser JWT to Game for
listing, filtering, suggestions, snapshot synchronization and deletion.

### Local Docker Compose integration

The repository includes a development Compose entry point for the three sibling
repositories. It uses the local Neon `develop` runtime roles; it does not start
an alternative PostgreSQL container and it never runs Prisma migrations.

From the sibling checkout layout, copy the private environment templates and
fill them with local test values:

```bash
copy compose.authuser.env.example compose.authuser.env
copy compose.game.env.example compose.game.env
copy compose.frontend.env.example compose.frontend.env
docker compose up --build
```

Keep the copied files private. AuthUser uses `AUTH_DATABASE_URL` and its JWT
private key, Game uses `GAME_DATABASE_URL` and the matching JWT public key, and
the Frontend uses the development IGDB/Twitch credentials. Do not place
`AUTH_DATABASE_DIRECT_URL` or `GAME_DATABASE_DIRECT_URL` in these files; those
are migration-only credentials for GitHub Actions. Keep PEM keys on one line
with literal `\n` escapes, as the backends normalize those values at startup.

Compose waits for the public OpenAPI endpoints before starting dependants:
Frontend is available at `http://localhost:3000`, AuthUser at
`http://localhost:3001/docs`, and Game at `http://localhost:3002/docs`.
Stop the stack with `docker compose down`; use `docker compose down -v` only
when you intentionally want to remove the dependency volumes.

### Favorites review

The GB-011.06 review covers the visitor redirect to sign-in, authenticated
favorite actions, Game Bearer-token boundaries, IGDB detail fallback, English
and Spanish copy, persisted theme preferences, and the responsive catalog
layout. Run the automated review with:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

The browser review uses the public catalog at desktop and mobile breakpoints;
favorite details keep their stored card data when IGDB is unavailable, while
the authenticated shelf keeps the same filters, pagination, and confirmation
patterns as the catalog.

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
