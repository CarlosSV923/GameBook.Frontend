import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { messages } from "@/shared/i18n/messages";
import { IgdbAttribution } from "@/shared/ui/igdb-attribution";

describe("IGDB attribution", () => {
  it("renders a visible, safe external link", () => {
    const markup = renderToStaticMarkup(
      createElement(IgdbAttribution, { messages: messages.en }),
    );

    expect(markup).toContain("Game data and images provided by");
    expect(markup).toContain('href="https://www.igdb.com/"');
    expect(markup).toContain('rel="noreferrer noopener"');
    expect(markup).toContain('target="_blank"');
  });
});
