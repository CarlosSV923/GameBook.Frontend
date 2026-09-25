import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

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

describe("FavoriteAction", () => {
  it("renders an accessible favorite control for an anonymous visitor", () => {
    const markup = renderToStaticMarkup(
      createElement(FavoriteAction, {
        gameId: game.igdbId,
        gameName: game.name,
        messages: messages.en,
        placement: "card",
        status: "anonymous",
      }),
    );

    expect(markup).toContain('aria-label="Save A Short Hike to favorites"');
    expect(markup).toContain('class="favorite-action favorite-action--card"');
    expect(markup).toContain('viewBox="0 0 24 24"');
    expect(markup).not.toContain(messages.en.catalog.favorite.prompt);
  });

  it("does not expose a save interaction while the session is loading", () => {
    const markup = renderToStaticMarkup(
      createElement(FavoriteAction, {
        gameId: game.igdbId,
        gameName: game.name,
        messages: messages.en,
        placement: "modal",
        status: "loading",
      }),
    );

    expect(markup).toContain('aria-label="Checking your session"');
    expect(markup).toContain("disabled");
    expect(markup).not.toContain("aria-expanded");
  });

  it("keeps the required anonymous prompt copy in both languages", () => {
    expect(messages.en.catalog.favorite.prompt).toBe(
      "To save favorites, you must:",
    );
    expect(messages.es.catalog.favorite.prompt).toBe(
      "Para guardar en favoritos debes:",
    );
  });

  it("places the action on both the catalog card and the detail modal", () => {
    const cardMarkup = renderToStaticMarkup(
      createElement(GameCard, {
        authStatus: "anonymous",
        game,
        messages: messages.en,
        onSelect: () => undefined,
      }),
    );
    const modalMarkup = renderToStaticMarkup(
      createElement(GameDetailModal, {
        authStatus: "anonymous",
        game,
        messages: messages.en,
        onClose: () => undefined,
      }),
    );

    expect(cardMarkup).toContain("favorite-action--card");
    expect(modalMarkup).toContain("favorite-action--modal");
  });
});
