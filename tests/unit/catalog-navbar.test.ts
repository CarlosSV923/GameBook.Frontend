import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

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
});
