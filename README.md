# GameBook.Frontend

[Read this README in Spanish](README.es.md)

`GameBook.Frontend` is the Next.js web application for GameBook. It lets visitors browse the public IGDB catalog and lets authenticated users manage their own favorite games.

## Responsibility

The frontend owns the browser experience, account and session flows, favorites UI, responsive presentation, persistent theme preference, and English/Spanish interface preference. It calls AuthUser and Game for GameBook operations. Its server-only IGDB adapter authenticates with Twitch application credentials so those credentials never reach the browser.

The browser does not call IGDB directly. The Next.js server exposes the local `/api/igdb/*` proxy routes, obtains and renews the Twitch application token, applies the contract limits of four requests per second and eight concurrent requests, and translates provider failures into the frontend API contract.

## Implemented architecture

- `src/app/` — Next.js App Router pages, layout, and server API route boundaries.
- `src/app/api/igdb/` — server-only catalog, detail, suggestions, and platform proxy routes.
- `src/features/` — product features such as authentication, catalog, favorites, profile, navigation, and preferences.
- `src/server/` — server-only IGDB and Twitch clients, request limiting, and provider error handling.
- `src/shared/` — API contracts, browser session storage, i18n messages, preference storage, and reusable UI primitives.

The browser stores the GameBook JWT in `sessionStorage`. Authenticated requests forward it as `Authorization: Bearer <token>` to AuthUser and Game. Public catalog requests remain available without a GameBook account.

## Local setup

Prerequisites:

- Node.js 24 or a compatible LTS version.
- pnpm 12.4.1, enabled through Corepack.
- Local test credentials for IGDB/Twitch when exercising the public catalog.
- The sibling AuthUser and Game repositories for the complete local integration.

Install dependencies and start the development server:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The frontend is available at `http://localhost:3000` by default.

## Runtime variables

Create a private, ignored `.env` file. The variable names required by the frontend are listed below without values:

```dotenv
IGDB_CLIENT_ID=
IGDB_CLIENT_SECRET=
NEXT_PUBLIC_AUTHUSER_URL=
NEXT_PUBLIC_GAME_URL=
```

`IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` are read only by server-side code. The two `NEXT_PUBLIC_` variables are the base URLs used by browser clients and must not contain the `/v1` suffix. Do not commit `.env` files or credentials. Restart the Next.js development server after changing a `NEXT_PUBLIC_` variable.

## Local service integration

Run AuthUser on local port 3001 and Game on local port 3002. AuthUser must allow the exact frontend origin `http://localhost:3000`; Game must allow the same origin and must resolve AuthUser through its own `AUTHUSER_URL` configuration.

The local service endpoints are:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:3000` |
| AuthUser Swagger UI | `http://localhost:3001/docs` |
| AuthUser OpenAPI JSON | `http://localhost:3001/docs/openapi.json` |
| Game Swagger UI | `http://localhost:3002/docs` |
| Game OpenAPI JSON | `http://localhost:3002/docs/openapi.json` |

The frontend supports registration, login, session/profile access, password change and revocation, favorite listing, filtering, suggestions, snapshot synchronization, and deletion through those services.

## Local Docker Compose

`compose.yaml` is the development entry point for the three sibling repositories. From the frontend repository, copy the ignored environment templates and fill them with local test credentials:

```bash
copy compose.authuser.env.example compose.authuser.env
copy compose.game.env.example compose.game.env
copy compose.frontend.env.example compose.frontend.env
docker compose up --build
```

The templates contain variable names only:

- `compose.authuser.env`: `AUTH_DATABASE_URL`, `JWT_AUDIENCE`, `JWT_ISSUER`, `JWT_PRIVATE_KEY`.
- `compose.game.env`: `GAME_DATABASE_URL`, `JWT_AUDIENCE`, `JWT_ISSUER`, `JWT_PUBLIC_KEY`.
- `compose.frontend.env`: `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET`.

Compose injects the local service URLs and ports for the three containers. It uses the Neon `develop` runtime roles, does not start a second PostgreSQL container, and does not run Prisma migrations. Migration-only variables such as `AUTH_DATABASE_DIRECT_URL` and `GAME_DATABASE_DIRECT_URL` must never be placed in these files. Keep copied environment files and PEM keys private.

Stop the stack with `docker compose down`. Use `docker compose down -v` only when intentionally removing the local dependency volumes.

## Tests and quality checks

```bash
pnpm test
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

## Related projects

- [GameBook.Microservice.AuthUser](https://github.com/CarlosSV923/GameBook.Microservice.AuthUser)
- [GameBook.Microservice.Game](https://github.com/CarlosSV923/GameBook.Microservice.Game)
