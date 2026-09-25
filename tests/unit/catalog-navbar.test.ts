import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { AuthProvider } from "@/features/auth/auth-provider";
import { CatalogNavbar } from "@/features/navigation/catalog-navbar";
import { PreferencesProvider } from "@/features/preferences/preferences-provider";

describe("CatalogNavbar", () => {
  it("shows visitor account actions without exposing authenticated links", () => {
    const markup = renderToStaticMarkup(
      createElement(
        AuthProvider,
        null,
        createElement(PreferencesProvider, null, createElement(CatalogNavbar)),
      ),
    );

    expect(markup).toContain('href="/login"');
    expect(markup).toContain('href="/register"');
    expect(markup).not.toContain('href="/profile"');
    expect(markup).not.toContain('href="/favorites"');
  });

  it("shows profile, favorites and sign-out actions for an authenticated user", () => {
    const markup = renderToStaticMarkup(
      createElement(
        AuthProvider,
        null,
        createElement(
          PreferencesProvider,
          null,
          createElement(CatalogNavbar, { authState: "authenticated" }),
        ),
      ),
    );

    expect(markup).toContain('href="/profile"');
    expect(markup).toContain('href="/favorites"');
    expect(markup).toContain('type="button"');
    expect(markup).toContain("Sign out");
    expect(markup).not.toContain('href="/login"');
    expect(markup).not.toContain('href="/register"');
  });
});
