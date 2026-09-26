# Contributing

## Branches

- `main` is the production branch.
- `develop` is the integration branch.
- Feature branches use `feature/[task-number]/[summary]`, for example `feature/006-02/initialize-frontend`.

## Pull requests

- Open feature pull requests from `feature/...` into `develop`.
- Describe the change and validation in English.
- Link the applicable task and specification or plan section.
- Keep commits in English and follow Conventional Commits.
- Do not include secrets, tokens, passwords, private keys, or IGDB/Twitch credentials.

## Local checks

- Use `pnpm` and commit the repository's `pnpm-lock.yaml` changes.
- Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` before opening a pull request.

The release flow from `develop` to `main` is coordinated separately after the required checks pass.
