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

## Production deployment

The public GameBook frontend is deployed on Vercel at [`https://gamebook-frontend.vercel.app`](https://gamebook-frontend.vercel.app). Its production service dependencies are AuthUser at [`https://gamebook-microservice-authuser.onrender.com`](https://gamebook-microservice-authuser.onrender.com) and Game at [`https://gamebook-microservice-game.onrender.com`](https://gamebook-microservice-game.onrender.com). AuthUser and Game expose their production Swagger UI at [`/docs`](https://gamebook-microservice-authuser.onrender.com/docs) and [`/docs`](https://gamebook-microservice-game.onrender.com/docs), respectively.

Production credentials remain server/provider configuration and are never committed to this repository.

## Runtime variables

Copy `.env.example` to a private, ignored `.env` file and fill only the local values. The template contains the variable names required by the frontend without values:

```dotenv
IGDB_CLIENT_ID=
IGDB_CLIENT_SECRET=
NEXT_PUBLIC_AUTHUSER_URL=
NEXT_PUBLIC_GAME_URL=
PORT=
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

## Individual local execution

This repository runs independently with the Next.js development server; no container orchestration is required. To exercise authenticated flows, start AuthUser and Game separately in their own repositories and configure the four frontend variables listed above.

From this repository, after copying `.env.example` to `.env`:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Use `pnpm start` after creating a production build with `pnpm build`. The frontend remains available at `http://localhost:3000`; AuthUser and Game expose their own startup instructions and local API documentation in their repositories.

## Tests and quality checks

```bash
pnpm test
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

## Release and deployment policy

Commits follow Conventional Commits. The `release-please` workflow runs only on `main` pushes or a manual dispatch, uses the manifest files in the repository, and authenticates with the minimum `GITHUB_TOKEN` permissions required to create release pull requests and GitHub releases. The regular CI validates pull requests and `main`; the release commit is validated by CI after the release pull request is merged.

`vercel.json` disables automatic Git deployments for every branch except `main`. No Vercel project or production deployment is created by this repository at this stage.

## Related projects

- [GameBook.Microservice.AuthUser](https://github.com/CarlosSV923/GameBook.Microservice.AuthUser)
- [GameBook.Microservice.Game](https://github.com/CarlosSV923/GameBook.Microservice.Game)
