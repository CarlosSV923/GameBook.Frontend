import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CatalogState } from "@/shared/ui/catalog-state";
import { messages } from "@/shared/i18n/messages";

describe("CatalogState", () => {
  it("renders translated loading, empty, and error states", () => {
    const loading = renderToStaticMarkup(
      createElement(CatalogState, {
        kind: "loading",
        messages: messages.en,
      }),
    );
    const empty = renderToStaticMarkup(
      createElement(CatalogState, {
        emptyMode: "noResults",
        kind: "empty",
        messages: messages.es,
      }),
    );
    const error = renderToStaticMarkup(
      createElement(CatalogState, {
        kind: "error",
        messages: messages.en,
        onRetry: () => undefined,
      }),
    );
    const end = renderToStaticMarkup(
      createElement(CatalogState, {
        kind: "end",
        messages: messages.en,
      }),
    );

    expect(loading).toContain(messages.en.states.loading);
    expect(loading).toContain('aria-live="polite"');
    expect(loading).not.toContain('data-variant="card"');
    expect(loading).toContain("aspect-[3/4]");
    expect(loading).toContain("animate-pulse");
    expect(empty).toContain(messages.es.states.noResultsTitle);
    expect(empty).toContain(messages.es.states.noResultsDescription);
    expect(error).toContain(messages.en.states.errorTitle);
    expect(error).toContain(messages.en.states.retry);
    expect(error).toContain('role="alert"');
    expect(end).toContain(messages.en.states.endOfResults);
    expect(end).toContain('role="status"');
    expect(end).not.toContain('data-variant="card"');
    expect(end).toContain('aria-hidden="true"');
    expect(end).toContain("bg-copper/70");
    expect(end).not.toContain(messages.en.indexStrip.unavailable);
  });

  it("uses the favorites copy at the end of the personal shelf", () => {
    for (const language of ["en", "es"] as const) {
      const end = renderToStaticMarkup(
        createElement(CatalogState, {
          context: "favorites",
          kind: "end",
          messages: messages[language],
        }),
      );

      expect(end).toContain(messages[language].favorites.endOfResults);
      expect(end).toContain(messages[language].favorites.eyebrow);
      expect(end).not.toContain(messages[language].catalog.eyebrow);
      expect(end).not.toContain(messages[language].states.endOfResults);
    }
  });
});
