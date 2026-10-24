import { defineConfig, devices } from "@playwright/test";

const port = 3180;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: process.env.CI ? "html" : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
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
  webServer: {
    command: "pnpm build && pnpm start",
    url: `http://127.0.0.1:${port}`,
    env: {
      PORT: String(port),
      NEXT_PUBLIC_AUTHUSER_URL: "https://authuser.example.test",
      NEXT_PUBLIC_GAME_URL: "https://game.example.test",
      IGDB_CLIENT_ID: "playwright-fake-client-id",
      IGDB_CLIENT_SECRET: "playwright-fake-client-secret",
    },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
