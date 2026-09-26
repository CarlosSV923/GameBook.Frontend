import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PreferenceIconControls } from "@/features/preferences/preference-controls";
import { PreferencesProvider } from "@/features/preferences/preferences-provider";

describe("PreferenceIconControls", () => {
  it("renders the theme icon and next-language initials with accessible actions", () => {
    const markup = renderToStaticMarkup(
      createElement(
        PreferencesProvider,
        null,
        createElement(PreferenceIconControls),
      ),
    );

    expect(markup).toContain('data-preference="theme"');
    expect(markup).toContain('aria-label="Switch to dark mode"');
    expect(markup).toContain('data-preference="language"');
    expect(markup).toContain('aria-label="Switch to Spanish"');
    expect(markup).toContain(">ES</span>");
    expect(markup).not.toContain(">Switch to dark mode<");
    expect(markup).not.toContain(">Switch to Spanish<");
    expect(markup).not.toContain('data-preference="language"><svg');
  });
});
