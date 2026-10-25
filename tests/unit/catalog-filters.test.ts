import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CatalogFilters } from "@/features/catalog/ui/catalog-filters";
import { PreferencesProvider } from "@/features/preferences/ui/preferences-provider";
import { QueryProvider } from "@/shared/query/query-client-provider";

describe("CatalogFilters", () => {
  it("keeps name search visible and exposes the advanced filter disclosure", () => {
    const markup = renderToStaticMarkup(
      createElement(
        QueryProvider,
        null,
        createElement(
          PreferencesProvider,
          null,
          createElement(CatalogFilters, { onApply: () => undefined }),
        ),
      ),
    );

    expect(markup).toContain('for="catalog-name">Game name</label>');
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('aria-label="Filters"');
    expect(markup).toContain('aria-controls="catalog-advanced-filters"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('aria-label="Close filters"');
    expect(markup).toContain('for="catalog-platform">Platform</label>');
    expect(markup).toContain('for="catalog-year-from">From year</label>');
    expect(markup).toContain('for="catalog-year-to">To year</label>');
    expect(markup).toContain(">Search</span>");
    expect(markup).toContain(">Clear</span>");
  });
});
