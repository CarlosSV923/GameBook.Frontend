import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";
import { IndexStrip } from "@/shared/ui/index-strip";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { TextField } from "@/shared/ui/text-field";
import { messages } from "@/shared/i18n/messages";

function render(element: ReactNode) {
  return renderToStaticMarkup(element);
}

describe("Button", () => {
  it("renders semantic buttons with variants, disabled and loading states", () => {
    const primary = render(
      createElement(Button, { variant: "primary" }, "Save"),
    );
    const secondary = render(
      createElement(Button, { variant: "secondary" }, "Cancel"),
    );
    const ghost = render(createElement(Button, { variant: "ghost" }, "Clear"));
    const pending = render(createElement(Button, { loading: true }, "Save"));
    const disabled = render(createElement(Button, { disabled: true }, "Save"));

    expect(primary).toContain('type="button"');
    expect(primary).toContain("bg-primary-action");
    expect(secondary).toContain("bg-paper-raised");
    expect(ghost).toContain("bg-transparent");
    expect(pending).toContain('aria-busy="true"');
    expect(pending).toContain("Save");
    expect(pending).toContain("disabled");
    expect(disabled).toContain("disabled");
    expect(primary).toContain("focus-visible:outline-focus");
  });

  it("renders an accessible Next link when href is provided", () => {
    const markup = render(
      createElement(Button, { href: "/favorites" }, "Favorites"),
    );
    expect(markup).toContain('href="/favorites"');
    expect(markup).toContain("Favorites");
    expect(markup).toContain("min-h-11");
  });
});

describe("IconButton", () => {
  it("requires and renders a label and optional pressed state", () => {
    const markup = render(
      createElement(
        IconButton,
        { "aria-label": "Save game", pressed: true },
        "★",
        "★",
      ),
    );
    expect(markup).toContain('aria-label="Save game"');
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('type="button"');
    expect(markup).toContain("size-11");
  });
});

describe("TextField", () => {
  it("keeps a persistent label and wires hint and error descriptions", () => {
    const markup = render(
      createElement(TextField, {
        error: "Enter a valid email",
        hint: "Used for sign in",
        label: "Email",
        name: "email",
        type: "email",
      }),
    );
    expect(markup).toContain("Email");
    expect(markup).toContain('name="email"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('aria-describedby="');
    expect(markup).toContain("Used for sign in");
    expect(markup).toContain("Enter a valid email");
    expect(markup).toContain("min-h-11");
  });
});

describe("SegmentedControl", () => {
  it("exposes its named group, pressed selection and disabled state", () => {
    const markup = render(
      createElement(SegmentedControl, {
        ariaLabel: "Theme",
        disabled: true,
        onChange: () => undefined,
        options: [
          { label: "Light", value: "light" },
          { label: "Dark", value: "dark" },
        ],
        value: "dark",
      }),
    );
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="Theme"');
    expect(markup).toContain('aria-pressed="false"');
    expect(markup).toContain('aria-pressed="true"');
    expect(markup.match(/disabled=""/g)).toHaveLength(2);
  });
});

describe("IndexStrip", () => {
  it("shows values only in card strips and keeps labeled details accessible", () => {
    for (const variant of ["card", "detail"] as const) {
      const markup = render(
        createElement(IndexStrip, {
          labels: messages.en.indexStrip,
          platforms: ["PC", "Switch"],
          rank: 2,
          score: 94,
          released: "2024-03-01",
          variant,
        }),
      );
      expect(markup).toContain(`data-variant="${variant}"`);
      expect(markup).toContain(
        'aria-label="Position: #2; Rating / 100: 94; Year: 2024; Platforms: PC · Switch"',
      );
      expect(markup).toContain("02");
      expect(markup).toContain(">94</dd>");
      expect(markup).not.toContain("94/100");
      expect(markup).toContain("2024");
      if (variant === "detail") {
        expect(markup).toContain("<dt");
        expect(markup).toContain("Rating / 100");
      } else {
        expect(markup).not.toContain("<dt");
      }
    }
  });

  it("rounds fractional ratings and prevents the score from wrapping", () => {
    const markup = render(
      createElement(IndexStrip, {
        labels: messages.en.indexStrip,
        rank: 1,
        score: 92.4,
        variant: "card",
      }),
    );
    expect(markup).toContain(
      'aria-label="Position: #1; Rating / 100: 92; Year: Unavailable; Platforms: Unavailable"',
    );
    expect(markup).toContain("whitespace-nowrap");
    expect(markup).toContain(">92</dd>");
  });

  it("marks missing metadata unavailable without inventing a rank", () => {
    const markup = render(
      createElement(IndexStrip, { labels: messages.es.indexStrip }),
    );
    expect(markup).toContain("No disponible");
    expect(markup).not.toContain("#1");
    expect(markup).not.toContain("/100");
  });
});
describe("theme token maps", () => {
  it("defines every semantic color in both light and dark maps", async () => {
    const { readFile } = await import("node:fs/promises");
    const css = await readFile("src/app/globals.css", "utf8");
    const semanticTokens = [
      "paper",
      "paper-raised",
      "paper-inset",
      "ink",
      "ink-secondary",
      "ink-muted",
      "slate",
      "copper",
      "copper-strong",
      "moss",
      "warning",
      "danger",
      "scrim",
      "focus",
      "primary-action",
      "primary-action-text",
      "border",
      "border-soft",
      "shadow-raised",
    ];
    const lightMap = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    const darkMap =
      css.match(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";

    expect(lightMap).not.toBe("");
    expect(darkMap).not.toBe("");
    for (const token of semanticTokens) {
      expect(lightMap, `light ${token}`).toContain(`--token-${token}:`);
      expect(darkMap, `dark ${token}`).toContain(`--token-${token}:`);
    }
    expect(css).toContain("--spacing: 0.25rem");
    expect(css).toContain("--radius-control: 6px");
    expect(css).toContain("--radius-card: 10px");
    expect(css).toContain("--radius-panel: 12px");
    expect(css).toContain("--radius-modal: 16px");
  });
});
