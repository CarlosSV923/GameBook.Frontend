import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const reviewState = vi.hoisted(() => ({
  authStatus: "authenticated" as "authenticated" | "anonymous" | "loading",
  language: "en" as "en" | "es",
  user: { email: "user@example.com", fullName: "Ada", id: "user-1" } as {
    email: string;
    fullName: string;
    id: string;
  } | null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/features/auth/auth-provider", () => ({
  useAuth: () => ({
    getAccessToken: () => "jwt-token",
    signOut: vi.fn(),
    status: reviewState.authStatus,
    user: reviewState.user,
  }),
}));

vi.mock("@/features/preferences/preferences-provider", async () => {
  const actual = await vi.importActual<typeof import("@/shared/i18n/messages")>(
    "@/shared/i18n/messages",
  );

  return {
    usePreferences: () => ({
      copy: actual.messages[reviewState.language],
      language: reviewState.language,
      setLanguage: vi.fn(),
      setTheme: vi.fn(),
      theme: "light",
    }),
  };
});

vi.mock("@/features/favorites/favorites-list", () => ({
  FavoritesList: () =>
    createElement("div", { "data-testid": "favorites-list" }),
}));

import { FavoritesPage } from "@/features/favorites/favorites-page";
import { messages } from "@/shared/i18n/messages";

describe("FavoritesPage review states", () => {
  it("keeps anonymous visitors out of the personal shelf in English", () => {
    reviewState.authStatus = "anonymous";
    reviewState.language = "en";
    reviewState.user = null;

    const markup = renderToStaticMarkup(createElement(FavoritesPage));

    expect(markup).toContain(messages.en.favorites.required);
    expect(markup).toContain(`href="/login"`);
    expect(markup).not.toContain('data-testid="favorites-list"');
  });

  it("keeps anonymous visitors out of the personal shelf in Spanish", () => {
    reviewState.authStatus = "anonymous";
    reviewState.language = "es";
    reviewState.user = null;

    const markup = renderToStaticMarkup(createElement(FavoritesPage));

    expect(markup).toContain(messages.es.favorites.required);
    expect(markup).toContain(messages.es.navigation.signIn);
    expect(markup).not.toContain('data-testid="favorites-list"');
  });

  it("renders the authenticated local shelf boundary in both supported languages", () => {
    reviewState.authStatus = "authenticated";
    reviewState.user = {
      email: "user@example.com",
      fullName: "Ada",
      id: "user-1",
    };

    for (const language of ["en", "es"] as const) {
      reviewState.language = language;
      const markup = renderToStaticMarkup(createElement(FavoritesPage));

      expect(markup).toContain(messages[language].favorites.title);
      expect(markup).toContain(messages[language].favorites.description);
      expect(markup).toContain('data-testid="favorites-list"');
    }
  });
});
