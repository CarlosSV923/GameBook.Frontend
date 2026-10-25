import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyPalette, GIFEncoder, quantize } from "gifenc";
import { PNG } from "pngjs";
import { expect, test, type Page } from "@playwright/test";

import { mockGameBook } from "../e2e/fixtures";

const screenshotRoot = join(process.cwd(), "docs/screenshots");

test("capture English and Spanish archive views and the main flow", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Desktop screenshot set only.",
  );
  const mocks = await mockGameBook(page);
  const englishDir = join(screenshotRoot, "en");
  const spanishDir = join(screenshotRoot, "es");
  mkdirSync(englishDir, { recursive: true });
  mkdirSync(spanishDir, { recursive: true });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Example Quest" }),
  ).toBeVisible();
  const gifFrames: Buffer[] = [await page.screenshot()];
  await page.screenshot({
    path: join(englishDir, "catalog.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Open details for Example Quest" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Example Quest" }),
  ).toBeVisible();
  await page.screenshot({ path: join(englishDir, "detail.png") });
  gifFrames.push(await page.screenshot());
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Sign in to save Example Quest to favorites" })
    .click();
  await expect(
    page.getByRole("region", { name: "To save to favorites, you need to:" }),
  ).toBeVisible();
  await page.screenshot({ path: join(englishDir, "anonymous-save.png") });
  gifFrames.push(await page.screenshot());
  writeGif(join(englishDir, "main-flow.gif"), gifFrames);
  await mocks.expectNoExternalRequests();

  await page.goto("/login");
  await page.screenshot({
    path: join(englishDir, "sign-in.png"),
    fullPage: true,
  });
  await signIn(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Save Example Quest to favorites" })
    .click();
  await page
    .getByRole("group", { name: "Confirm saving Example Quest" })
    .getByRole("button", { name: "Save" })
    .click();
  await page.getByRole("link", { name: "Favorite games" }).click();
  await expect(
    page.getByRole("heading", { name: "Example Quest" }),
  ).toBeVisible();
  await page.screenshot({
    path: join(englishDir, "favorites.png"),
    fullPage: true,
  });
  await page.getByRole("link", { name: "Profile" }).click();
  await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  await page.screenshot({
    path: join(englishDir, "profile.png"),
    fullPage: true,
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Switch to Spanish" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.screenshot({
    path: join(spanishDir, "catalog.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Abrir detalle de Example Quest" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Example Quest" }),
  ).toBeVisible();
  await page.screenshot({ path: join(spanishDir, "detail.png") });
  await page.keyboard.press("Escape");
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.screenshot({
    path: join(spanishDir, "sign-in.png"),
    fullPage: true,
  });
  await signIn(page, "es");
  await page.goto("/favorites");
  await expect(
    page.getByRole("heading", { name: "Example Quest" }),
  ).toBeVisible();
  await page.screenshot({
    path: join(spanishDir, "favorites.png"),
    fullPage: true,
  });
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Perfil" })).toBeVisible();
  await page.screenshot({
    path: join(spanishDir, "profile.png"),
    fullPage: true,
  });
  await mocks.expectNoExternalRequests();

  // Persisted preferences drive the dark English capture, as a visitor would.
  await page.evaluate(() => {
    localStorage.setItem("gamebook.language", "en");
    localStorage.setItem("gamebook.theme", "dark");
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("heading", { name: "Example Quest" }),
  ).toBeVisible();
  await page.screenshot({
    path: join(englishDir, "catalog-dark.png"),
    fullPage: true,
  });
  void testInfo;
});

test("capture phone catalog", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Phone screenshot only.");
  const mocks = await mockGameBook(page);
  mkdirSync(join(screenshotRoot, "en"), { recursive: true });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Example Quest" }),
  ).toBeVisible();
  await page.screenshot({
    path: join(screenshotRoot, "en/catalog-phone.png"),
    fullPage: true,
  });
  await mocks.expectNoExternalRequests();
});

async function signIn(page: Page, language: "en" | "es" = "en") {
  await page.goto("/login");
  await page
    .getByLabel(language === "en" ? "Email address" : "Correo electrónico")
    .fill("ada.lovelace@example.test");
  await page
    .getByLabel(language === "en" ? "Password" : "Contraseña", { exact: true })
    .fill("GameBook@2026");
  await page
    .getByRole("button", {
      name: language === "en" ? "Sign in" : "Iniciar sesión",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL("/");
}

function writeGif(path: string, frames: Buffer[]) {
  const decoded = frames.map((frame) => PNG.sync.read(frame));
  const palette = quantize(decoded[0].data, 256);
  const encoder = GIFEncoder();
  for (const frame of decoded) {
    encoder.writeFrame(
      applyPalette(frame.data, palette),
      frame.width,
      frame.height,
      {
        palette,
        delay: 800,
        repeat: 0,
      },
    );
  }
  encoder.finish();
  writeFileSync(path, encoder.bytes());
}
