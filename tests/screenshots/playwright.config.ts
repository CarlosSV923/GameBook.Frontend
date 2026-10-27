import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

// Web servers run from the repository root, not from this folder.
const repoRoot = path.resolve(__dirname, "../..");

const port = 3180;

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:${port}`, trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: [
    {
      command: "node tests/e2e/fake-igdb-server.mjs",
      cwd: repoRoot,
      url: "http://127.0.0.1:3181/health",
      env: { FAKE_IGDB_PORT: "3181" },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm build && pnpm start",
      cwd: repoRoot,
      url: `http://127.0.0.1:${port}`,
      env: {
        PORT: String(port),
        NEXT_PUBLIC_AUTHUSER_URL: "https://authuser.example.test",
        NEXT_PUBLIC_GAME_URL: "https://game.example.test",
        IGDB_CLIENT_ID: "playwright-fake-client-id",
        IGDB_CLIENT_SECRET: "playwright-fake-client-secret",
        IGDB_API_BASE_URL: "http://127.0.0.1:3181/v4",
        TWITCH_TOKEN_URL: "http://127.0.0.1:3181/oauth2/token",
      },
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
