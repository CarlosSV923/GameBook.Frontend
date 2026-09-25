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

    expect(loading).toContain(messages.en.states.loading);
    expect(empty).toContain(messages.es.states.noResultsTitle);
    expect(empty).toContain(messages.es.states.noResultsDescription);
    expect(error).toContain(messages.en.states.errorTitle);
    expect(error).toContain(messages.en.states.retry);
    expect(error).toContain('role="alert"');
  });
});
