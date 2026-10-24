import { expect, test } from "@playwright/test";

import { exampleGame, mockGameBook } from "./fixtures";

test("visitor and signed-in favorite journey", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Covered by focused mobile journeys.",
  );
  const mocks = await mockGameBook(page);

  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "A considered place for games worth keeping.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Example Quest" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.getByRole("combobox", { name: "Game name" }).fill("Example");
  await expect(
    page.getByRole("option", { name: "Example Quest" }),
  ).toBeVisible();
  await page.getByRole("combobox", { name: "Platform" }).fill("PC");
  await page.getByRole("option", { name: "PC" }).click();
  await page.getByRole("spinbutton", { name: "From year" }).fill("2010");
  await page.getByRole("spinbutton", { name: "To year" }).fill("2020");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(
    page.getByRole("heading", { name: "Example Quest" }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Open details for Example Quest" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Example Quest" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close game details" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page
    .getByRole("button", { name: "Sign in to save Example Quest to favorites" })
    .click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/register");
  await page.getByLabel("Full name").fill("Ada Lovelace");
  await page.getByLabel("Email address").fill("ada.lovelace@example.test");
  await page.getByLabel("Password", { exact: true }).fill("GameBook@2026");
  await page.getByLabel("Confirm password").fill("GameBook@2026");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL(/\/login\?registered=1$/);
  await expect(page.getByRole("status")).toContainText(
    "Your account is ready.",
  );

  await page.getByLabel("Email address").fill("ada.lovelace@example.test");
  await page.getByLabel("Password", { exact: true }).fill("GameBook@2026");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/");
  await page
    .getByRole("button", { name: `Save ${exampleGame.name} to favorites` })
    .click();
  // A saved catalog card switches to the remove action (GB-012.17).
  await expect(
    page.getByRole("button", {
      name: `Remove ${exampleGame.name} from favorites`,
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Favorite games" }).click();
  await expect(
    page.getByRole("heading", { name: "Favorite games" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: exampleGame.name }),
  ).toBeVisible();
  await page.getByRole("combobox", { name: "Game name" }).fill("Example");
  await expect(
    page.getByRole("option", { name: exampleGame.name }),
  ).toBeVisible();
  await page.getByRole("option", { name: exampleGame.name }).click();
  await page.getByRole("combobox", { name: "Platform" }).fill("PC");
  await expect(page.getByRole("option", { name: "PC" })).toBeVisible();
  await page.getByRole("combobox", { name: "Platform" }).press("Tab");
  await page.keyboard.press("Enter");
  await page.getByRole("spinbutton", { name: "From year" }).fill("2010");
  await page.getByRole("spinbutton", { name: "To year" }).fill("2020");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(
    page.getByRole("heading", { name: exampleGame.name }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: `Remove ${exampleGame.name} from favorites` })
    .click();
  const confirmation = page.getByRole("group", { name: "Remove favorite" });
  await expect(confirmation).toBeVisible();
  await confirmation
    .getByRole("button", { name: "Remove", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: exampleGame.name }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Switch to Spanish" }).click();
  await page.getByRole("button", { name: "Cambiar al modo oscuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("combobox", { name: "Plataforma" })).toHaveValue(
    "PC",
  );
  await expect(
    page.getByRole("link", { name: "Juegos favoritos" }),
  ).toBeVisible();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("link", { name: "Juegos favoritos" }),
  ).toBeVisible();
  await mocks.expectNoExternalRequests();
});

test("mobile public catalog and detail", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Runs in the mobile project.");
  const mocks = await mockGameBook(page);

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: exampleGame.name }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open details for Example Quest" })
    .click();
  await expect(
    page.getByRole("dialog", { name: exampleGame.name }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close game details" }).click();
  await mocks.expectNoExternalRequests();
});

test("mobile login form accepts a session", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Runs in the mobile project.");
  const mocks = await mockGameBook(page);

  await page.goto("/login");
  await page.getByLabel("Email address").fill("ada.lovelace@example.test");
  await page.getByLabel("Password", { exact: true }).fill("GameBook@2026");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("link", { name: "Favorite games" }),
  ).toBeVisible();
  await mocks.expectNoExternalRequests();
});
