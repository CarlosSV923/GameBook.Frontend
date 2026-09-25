import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { FavoriteAction } from "@/features/catalog/favorite-action";
import { GameCard } from "@/features/catalog/game-card";
import { GameDetailModal } from "@/features/catalog/game-detail-modal";
import { messages } from "@/shared/i18n/messages";

const game = {
  igdbId: 42,
  imageUrl: null,
  name: "A Short Hike",
  platforms: [{ id: 6, name: "PC" }],
  rating: 83,
  released: "2019-07-30",
};

const onSave = async () => undefined;

describe("FavoriteAction", () => {
  it("routes anonymous visitors to sign in without rendering a tooltip", () => {
    const markup = renderToStaticMarkup(
      createElement(FavoriteAction, {
        game,
        messages: messages.en,
        onSave,
        placement: "card",
        status: "anonymous",
      }),
    );

    expect(markup).toContain(
      'aria-label="Sign in to save A Short Hike to favorites"',
    );
    expect(markup).toContain('class="favorite-action favorite-action--card"');
    expect(markup).toContain('aria-pressed="false"');
    expect(markup).not.toContain("favorite-action__prompt");
  });

  it("renders a direct authenticated save action", () => {
    const markup = renderToStaticMarkup(
      createElement(FavoriteAction, {
        game,
        messages: messages.en,
        onSave,
        placement: "modal",
        status: "authenticated",
      }),
    );

    expect(markup).toContain('aria-label="Save A Short Hike to favorites"');
    expect(markup).toContain('class="favorite-action favorite-action--modal"');
    expect(markup).not.toContain("favorite-action__prompt");
  });

  it("does not expose a save interaction while the session is loading", () => {
    const markup = renderToStaticMarkup(
      createElement(FavoriteAction, {
        game,
        messages: messages.en,
        onSave,
        placement: "modal",
        status: "loading",
      }),
    );

    expect(markup).toContain('aria-label="Checking your session"');
    expect(markup).toContain("disabled");
  });

  it("keeps the direct-action copy in both languages", () => {
    expect(messages.en.catalog.favorite.signIn).toBe(
      "Sign in to save {name} to favorites",
    );
    expect(messages.es.catalog.favorite.signIn).toBe(
      "Inicia sesión para guardar {name} en favoritos",
    );
  });

  it("places the action on both the catalog card and the detail modal", () => {
    const cardMarkup = renderToStaticMarkup(
      createElement(GameCard, {
        authStatus: "anonymous",
        game,
        messages: messages.en,
        onSave,
        onSelect: () => undefined,
      }),
    );
    const modalMarkup = renderToStaticMarkup(
      createElement(GameDetailModal, {
        authStatus: "anonymous",
        game,
        messages: messages.en,
        onSave,
        onClose: () => undefined,
      }),
    );

    expect(cardMarkup).toContain("favorite-action--card");
    expect(modalMarkup).toContain("favorite-action--modal");
  });
});
