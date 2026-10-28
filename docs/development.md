# Development

## Local setup

Use Node.js 24 and pnpm 12.4.1 (Corepack). Copy `.env.example` to `.env`; the template lists names only. Set local values privately, then run:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The app runs at `http://localhost:3000`. The public catalog needs IGDB/Twitch application credentials. Authenticated flows also need the AuthUser and Game services; run them in their sibling repositories or use the local integration Compose described in [GameBook.System](https://github.com/CarlosSV923/GameBook.System).

## Environment variables

| Variable                   | Meaning                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `IGDB_CLIENT_ID`           | Twitch application client ID used by the server to request an IGDB access token.                           |
| `IGDB_CLIENT_SECRET`       | Twitch application client secret; server-side only.                                                        |
| `NEXT_PUBLIC_AUTHUSER_URL` | Base URL for browser requests to AuthUser, without a `/v1` suffix.                                         |
| `NEXT_PUBLIC_GAME_URL`     | Base URL for browser requests to Game, without a `/v1` suffix.                                             |
| `PORT`                     | Optional Next.js listening port.                                                                           |
| `FAKE_IGDB_PORT`           | Test-only port for the local fake IGDB/Twitch server.                                                      |
| `IGDB_API_BASE_URL`        | Optional IGDB API override, accepted only for loopback hosts; used by E2E's fake IGDB server.              |
| `TWITCH_TOKEN_URL`         | Optional Twitch token endpoint override, accepted only for loopback hosts; used by E2E's fake IGDB server. |

Use separate IGDB/Twitch applications for development and production. Both environments use the names `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET`; configure the respective credentials only in that environment. Never put production values in local files or version control.

The E2E and screenshot Playwright configurations start `tests/e2e/fake-igdb-server.mjs` on loopback and direct the IGDB API and token requests to it using `IGDB_API_BASE_URL` and `TWITCH_TOKEN_URL`. The fake server and browser fixtures return fictitious games; neither flow needs live IGDB or Twitch credentials.

## Quality commands

| Command             | Runs                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------- |
| `pnpm test`         | Vitest unit tests once.                                                               |
| `pnpm test:e2e`     | Playwright browser E2E projects.                                                      |
| `pnpm screenshots`  | Playwright screenshot suite and generated README images/GIF from fictitious fixtures. |
| `pnpm format`       | Formats source, tests and root JavaScript/TypeScript config files with Prettier.      |
| `pnpm format:check` | Checks those source, test and config files with Prettier.                             |
| `pnpm lint`         | ESLint over the repository.                                                           |
| `pnpm typecheck`    | TypeScript check without emitting files.                                              |
| `pnpm build`        | Next.js production build.                                                             |

For local production mode, run `pnpm build` followed by `pnpm start`.

## Release and deployment

The release-please workflow runs on pushes to `main` and manual dispatch. It opens or updates a release pull request from the Conventional Commits on `main`; merging that PR creates the version tag and GitHub release. Changes reach `main` through a `develop` → `main` promotion PR, followed by the release-please PR.

Feature pull requests to `develop` use “Rebase and merge” so release-please lists each change once. Promotion (`develop` → `main`) and sync (`main` → `develop`) pull requests use a merge commit. After each release, the workflow opens a `main` → `develop` sync PR if one is not already open.

Vercel deploys the frontend from `main` at [gamebook-frontend.vercel.app](https://gamebook-frontend.vercel.app). Configure `NEXT_PUBLIC_AUTHUSER_URL`, `NEXT_PUBLIC_GAME_URL`, `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` in the Vercel project. `vercel.json` enables Git deployment for `main` only. The backend services are deployed independently to Render; this repository does not configure backend preview deployments.

## Docker

This repository contains a production `Dockerfile`; it does not contain a Compose file. The local multi-repository Compose setup and instructions are maintained in [GameBook.System](https://github.com/CarlosSV923/GameBook.System).
