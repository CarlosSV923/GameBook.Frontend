import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GIFEncoder, nearestColorIndex, quantize } from "gifenc";
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
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Sign in to save Example Quest to favorites" })
    .click();
  await expect(
    page.getByRole("region", { name: "To save to favorites, you need to:" }),
  ).toBeVisible();
  await page.screenshot({ path: join(englishDir, "anonymous-save.png") });
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

// The README GIF walks the whole flow; each step is held long enough to read
// and is captured only once animations, fonts and visible images settle.
test("record the main flow GIF", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop GIF only.");
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  const mocks = await mockGameBook(page);
  const frames: GifFrame[] = [];
  const hold = async (delay: number) => {
    await settle(page);
    frames.push({ png: await page.screenshot(), delay });
  };

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Example Quest" }),
  ).toBeVisible();
  await hold(2500);
  await scrollToCatalog(page);
  await hold(2500);
  await page
    .getByRole("button", { name: "Open details for Example Quest" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Example Quest" }),
  ).toBeVisible();
  await hold(3500);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Sign in to save Example Quest to favorites" })
    .click();
  await expect(
    page.getByRole("region", { name: "To save to favorites, you need to:" }),
  ).toBeVisible();
  await hold(3000);
  await page.keyboard.press("Escape");

  await page.goto("/login");
  await page.getByLabel("Email address").fill("ada.lovelace@example.test");
  await page.getByLabel("Password", { exact: true }).fill("GameBook@2026");
  await hold(2500);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/");
  await scrollToCatalog(page);
  await page
    .getByRole("button", { name: "Save Example Quest to favorites" })
    .click();
  await expect(
    page.getByRole("group", { name: "Confirm saving Example Quest" }),
  ).toBeVisible();
  await hold(3000);
  await page
    .getByRole("group", { name: "Confirm saving Example Quest" })
    .getByRole("button", { name: "Save" })
    .click();
  await expect(
    page.getByRole("button", { name: "Remove Example Quest from favorites" }),
  ).toBeVisible();
  await hold(2500);
  await page.getByRole("link", { name: "Favorite games" }).click();
  await expect(
    page.getByRole("heading", { name: "Example Quest" }),
  ).toBeVisible();
  // Client navigation keeps the catalog scroll; show the page from the top.
  await page.evaluate(() => window.scrollTo(0, 0));
  await hold(4000);

  writeGif(join(screenshotRoot, "en/main-flow.gif"), frames);
  await mocks.expectNoExternalRequests();
  await context.close();
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

type GifFrame = { png: Buffer; delay: number };

async function scrollToCatalog(page: Page) {
  // Put the ranking heading just below the sticky header.
  await page
    .getByRole("heading", { name: "Top rated of all time" })
    .evaluate((heading) =>
      window.scrollTo(
        0,
        heading.getBoundingClientRect().top + window.scrollY - 96,
      ),
    );
}

async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const visible = Array.from(document.images).filter((image) => {
      const box = image.getBoundingClientRect();
      return box.bottom > 0 && box.top < window.innerHeight && !image.complete;
    });
    await Promise.all(
      visible.map(
        (image) =>
          new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          }),
      ),
    );
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) => animation.effect?.getTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => undefined)),
    );
  });
}

// Each frame gets its own palette so dark overlays keep their colors, and
// Floyd–Steinberg dithering so cover gradients do not band.
function writeGif(path: string, frames: GifFrame[]) {
  const encoder = GIFEncoder();
  for (const { png, delay } of frames) {
    const { data, width, height } = PNG.sync.read(png);
    const palette = quantize(data, 256);
    encoder.writeFrame(dither(data, width, height, palette), width, height, {
      palette,
      delay,
      repeat: 0,
    });
  }
  encoder.finish();
  writeFileSync(path, encoder.bytes());
}

function dither(
  rgba: Uint8Array,
  width: number,
  height: number,
  palette: number[][],
) {
  const pixels = Float32Array.from(rgba);
  const indexed = new Uint8Array(width * height);
  // Nearest-color lookups cached per 5-6-5 color to keep this fast.
  const cache = new Int16Array(1 << 16).fill(-1);
  const spread = (x: number, y: number, error: number[], weight: number) => {
    if (x < 0 || x >= width || y >= height) return;
    const offset = (y * width + x) * 4;
    for (let channel = 0; channel < 3; channel += 1) {
      pixels[offset + channel] += error[channel] * weight;
    }
  };
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const color = [0, 1, 2].map((channel) =>
        Math.max(0, Math.min(255, Math.round(pixels[offset + channel]))),
      );
      const key =
        ((color[0] >> 3) << 11) | ((color[1] >> 2) << 5) | (color[2] >> 3);
      if (cache[key] < 0) cache[key] = nearestColorIndex(palette, color);
      const index = cache[key];
      indexed[y * width + x] = index;
      const error = color.map(
        (value, channel) => value - palette[index][channel],
      );
      spread(x + 1, y, error, 7 / 16);
      spread(x - 1, y + 1, error, 3 / 16);
      spread(x, y + 1, error, 5 / 16);
      spread(x + 1, y + 1, error, 1 / 16);
    }
  }
  return indexed;
}
