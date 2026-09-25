import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { messages } from "@/shared/i18n/messages";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));
vi.mock("@/features/auth/auth-provider", () => ({
  useAuth: () => ({
    signOut: vi.fn(),
    status: "authenticated",
    user: { email: "user@example.com", fullName: "Ada", id: "user-1" },
  }),
}));
vi.mock("@/features/preferences/preferences-provider", () => ({
  usePreferences: () => ({
    copy: messages.en,
    language: "en",
    setLanguage: vi.fn(),
    setTheme: vi.fn(),
    theme: "light",
  }),
}));
vi.mock("@/features/favorites/favorites-list", () => ({
  FavoritesList: () =>
    createElement("div", { "data-testid": "favorites-list" }),
}));

import { FavoritesPage } from "@/features/favorites/favorites-page";

describe("FavoritesPage", () => {
  it("renders the authenticated personal shelf and its local list boundary", () => {
    const markup = renderToStaticMarkup(createElement(FavoritesPage));

    expect(markup).toContain(messages.en.favorites.title);
    expect(markup).toContain(messages.en.favorites.description);
    expect(markup).toContain('data-testid="favorites-list"');
  });
});
