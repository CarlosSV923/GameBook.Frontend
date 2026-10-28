import { expect, test, type Page } from "@playwright/test";

import { exampleGame, mockGameBook } from "./fixtures";

test("visitor and signed-in favorite journey", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Covered by focused mobile journeys.",
  );
  const mocks = await mockGameBook(page);
  const catalogRequests: string[] = [];
  const favoriteSaveRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/igdb/games")
      catalogRequests.push(request.url());
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname === "/v1/favorites"
    ) {
      favoriteSaveRequests.push(request.url());
    }
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "A considered place for games worth keeping.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Example Quest" }),
  ).toBeVisible();
  await expectUniformPosterGrid(page, 4);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(
    page.getByText(
      "The ranking uses IGDB’s combined critic and player rating.",
    ),
  ).toBeVisible();
  await expect(page.locator('[aria-label*="Rating / 100: 92"]')).toBeVisible();
  expect(catalogRequests).toEqual([]);

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

  const openDetails = page.getByRole("button", {
    name: "Open details for Example Quest",
  });
  await openDetails.click();
  await expect(
    page.getByRole("dialog", { name: "Example Quest" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(openDetails).toBeFocused();

  const anonymousTrigger = page.getByRole("button", {
    name: "Sign in to save Example Quest to favorites",
  });
  await anonymousTrigger.click();
  expect(favoriteSaveRequests).toEqual([]);
  const anonymousPopover = page.getByRole("region", {
    name: "To save to favorites, you need to:",
  });
  await expect(anonymousPopover).toContainText(
    "To save to favorites, you need to:",
  );
  await expect(anonymousTrigger).toHaveAttribute("aria-expanded", "true");
  const anonymousPopoverId = await anonymousPopover.getAttribute("id");
  if (!anonymousPopoverId) throw new Error("The favorite popover needs an id");
  await expect(anonymousTrigger).toHaveAttribute(
    "aria-controls",
    anonymousPopoverId,
  );
  await expect(
    anonymousPopover.getByRole("link", { name: "Sign in", exact: true }),
  ).toBeFocused();
  await expect(
    anonymousPopover.getByRole("link", { name: "Sign in", exact: true }),
  ).toHaveAttribute("href", "/login");
  await expect(
    anonymousPopover.getByRole("link", {
      name: "Create account",
      exact: true,
    }),
  ).toHaveAttribute("href", "/register");
  await anonymousPopover.getByRole("link", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page
    .getByRole("navigation", { name: "Account navigation" })
    .getByRole("link", { name: "Create account" })
    .click();
  await expect(page).toHaveURL(/\/register$/);
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
  const saveConfirmation = page.getByRole("group", {
    name: `Confirm saving ${exampleGame.name}`,
  });
  await expect(saveConfirmation).toBeVisible();
  await expect(
    saveConfirmation.getByRole("button", { name: "Save" }),
  ).toBeVisible();
  await expect(
    saveConfirmation.getByRole("button", { name: "Cancel" }),
  ).toBeVisible();
  expect(favoriteSaveRequests).toEqual([]);
  await saveConfirmation.getByRole("button", { name: "Cancel" }).click();
  await expect(saveConfirmation).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: `Save ${exampleGame.name} to favorites`,
    }),
  ).toBeFocused();
  expect(favoriteSaveRequests).toEqual([]);
  await page
    .getByRole("button", { name: `Save ${exampleGame.name} to favorites` })
    .click();
  const reopenedSaveConfirmation = page.getByRole("group", {
    name: `Confirm saving ${exampleGame.name}`,
  });
  await reopenedSaveConfirmation.getByRole("button", { name: "Save" }).click();
  await expect.poll(() => favoriteSaveRequests).toHaveLength(1);
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
  const favoritesEnd = page
    .getByRole("status")
    .filter({ hasText: "You have reached the end of your favorites." });
  await expect(favoritesEnd).toBeVisible();
  await expect(favoritesEnd).toContainText("Personal shelf");
  await expect(page.getByText("Public catalog")).toHaveCount(0);
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

  // The ranking note and 0–100 label belong to the public catalog.
  await page.goto("/");
  await expect(
    page.getByText(
      "La clasificación usa la puntuación combinada de la crítica y los jugadores de IGDB.",
    ),
  ).toBeVisible();
  await expect(
    page.locator('[aria-label*="Puntuación / 100: 92"]'),
  ).toBeVisible();
  await mocks.expectNoExternalRequests();
});

test("initial HTML contains the server-prefetched catalog page", async ({
  request,
}) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  expect(await response.text()).toContain("Example Quest");
});

test("mobile public catalog and detail", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Runs in the mobile project.");
  const mocks = await mockGameBook(page);

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: exampleGame.name }),
  ).toBeVisible();
  await expectUniformPosterGrid(page, 2);
  const favoriteTrigger = page.getByRole("button", {
    name: `Sign in to save ${exampleGame.name} to favorites`,
  });
  await favoriteTrigger.click();
  const anonymousPopover = page.getByRole("region", {
    name: "To save to favorites, you need to:",
  });
  await expect(anonymousPopover).toBeVisible();
  await expect(favoriteTrigger).toHaveAttribute("aria-expanded", "true");
  const popoverBounds = await anonymousPopover.boundingBox();
  const viewport = page.viewportSize();
  expect(popoverBounds).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(popoverBounds!.x).toBeGreaterThanOrEqual(0);
  expect(popoverBounds!.y).toBeGreaterThanOrEqual(0);
  expect(popoverBounds!.x + popoverBounds!.width).toBeLessThanOrEqual(
    viewport!.width,
  );
  expect(popoverBounds!.y + popoverBounds!.height).toBeLessThanOrEqual(
    viewport!.height,
  );
  await page.keyboard.press("Escape");
  await expect(favoriteTrigger).toBeFocused();
  await page
    .getByRole("button", { name: "Open details for Example Quest" })
    .click();
  await expect(
    page.getByRole("dialog", { name: exampleGame.name }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close game details" }).click();
  await mocks.expectNoExternalRequests();
});

test("mobile navigation and catalog filters open and close accessibly", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Runs in the mobile project.");
  const mocks = await mockGameBook(page);

  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Open menu" });
  await menuButton.click();
  await expect(
    page.getByRole("region", { name: "Mobile navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close menu" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();

  const filtersButton = page.getByRole("button", { name: "Filters" });
  await filtersButton.click();
  await expect(page.getByRole("region", { name: "Filters" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Filters" })).toBeFocused();
  await expect(page.getByRole("combobox", { name: "Game name" })).toBeVisible();
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
  // On phones the account navigation lives in the header menu.
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(
    page.getByRole("link", { name: "Favorite games" }),
  ).toBeVisible();
  await mocks.expectNoExternalRequests();
});

test("catalog loads the next page when scrolling to the sentinel", async ({
  page,
}, testInfo) => {
  await mockGameBook(page, { catalogPagination: true });
  await page.goto("/");
  // The unfiltered first page is server-rendered; a filtered search is
  // paginated by the browser and answered by the pagination fixtures.
  if (testInfo.project.name === "mobile") {
    // Year filters sit in the mobile filters panel.
    await page.getByRole("button", { name: "Filters" }).click();
  }
  await page.getByRole("spinbutton", { name: "From year" }).fill("2000");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(
    page.getByRole("heading", { name: "Pagination Example 1", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("heading", { name: "Pagination Example 20", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("heading", { name: "Pagination Example 21", exact: true }),
  ).toBeVisible();
});

// Poster cards in a grid row share one height and keep a 3:4 cover, whatever
// the title or platform list length.
async function expectUniformPosterGrid(page: Page, columns: number) {
  const cards = page.locator("[data-game-card]");
  await expect(cards).toHaveCount(4);
  const boxes = await Promise.all(
    [0, 1, 2, 3].map(async (index) => (await cards.nth(index).boundingBox())!),
  );
  const firstRow = boxes.filter(({ y }) => Math.abs(y - boxes[0].y) < 1);
  expect(firstRow).toHaveLength(columns);
  for (const box of boxes) {
    const rowStart = boxes[Math.floor(boxes.indexOf(box) / columns) * columns];
    expect(Math.abs(box.y - rowStart.y)).toBeLessThan(1);
    expect(Math.abs(box.height - rowStart.height)).toBeLessThanOrEqual(1);
  }
  const cover = (await cards
    .first()
    .getByRole("button", { name: /^Open details for / })
    .boundingBox())!;
  expect(cover.height / cover.width).toBeCloseTo(4 / 3, 1);
}
