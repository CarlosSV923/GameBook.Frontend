import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import {
  FavoriteAction,
  FavoriteDeleteAction,
} from "@/features/catalog/ui/favorite-action";
import { GameCard } from "@/features/catalog/ui/game-card";
import { GameDetailModal } from "@/features/catalog/ui/game-detail-modal";
import { QueryProvider } from "@/shared/query/query-client-provider";
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
const onDelete = async () => undefined;

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
    expect(markup).toContain('class="inline-grid size-11');
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

  it("renders a contextual delete action without a save tooltip", () => {
    const markup = renderToStaticMarkup(
      createElement(FavoriteDeleteAction, {
        game,
        messages: messages.en,
        onDelete,
        placement: "card",
      }),
    );

    expect(markup).toContain('aria-label="Remove A Short Hike from favorites"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).not.toContain("favorite-action__prompt");
    expect(markup).not.toContain("Sign in");
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
        position: 3,
        messages: messages.en,
        onSave,
        onSelect: () => undefined,
      }),
    );
    const modalMarkup = renderToStaticMarkup(
      createElement(
        QueryProvider,
        null,
        createElement(GameDetailModal, {
          authStatus: "anonymous",
          game,
          messages: messages.en,
          onSave,
          onClose: () => undefined,
        }),
      ),
    );

    expect(cardMarkup).toContain('aria-label="Position: #3;');
    expect(modalMarkup).toContain(
      'aria-label="Sign in to save A Short Hike to favorites"',
    );

    const favoriteCardMarkup = renderToStaticMarkup(
      createElement(GameCard, {
        authStatus: "authenticated",
        game,
        position: 1,
        messages: messages.en,
        onDelete,
        onSelect: () => undefined,
      }),
    );
    const favoriteModalMarkup = renderToStaticMarkup(
      createElement(
        QueryProvider,
        null,
        createElement(GameDetailModal, {
          authStatus: "authenticated",
          game,
          messages: messages.en,
          onClose: () => undefined,
          onDelete,
        }),
      ),
    );

    expect(favoriteCardMarkup).toContain(
      'aria-label="Remove A Short Hike from favorites"',
    );
    expect(favoriteModalMarkup).toContain(
      'aria-label="Remove A Short Hike from favorites"',
    );
  });

  it("uses the shared favorite state to switch catalog actions", () => {
    const savedMarkup = renderToStaticMarkup(
      createElement(GameCard, {
        authStatus: "authenticated",
        game,
        position: 1,
        isFavorite: true,
        messages: messages.en,
        onDelete,
        onSave,
        onSelect: () => undefined,
      }),
    );
    const unsavedMarkup = renderToStaticMarkup(
      createElement(GameCard, {
        authStatus: "authenticated",
        game,
        isFavorite: false,
        messages: messages.en,
        onDelete,
        onSave,
        onSelect: () => undefined,
      }),
    );

    expect(savedMarkup).toContain(
      'aria-label="Remove A Short Hike from favorites"',
    );
    expect(unsavedMarkup).toContain(
      'aria-label="Save A Short Hike to favorites"',
    );
  });

  it("renders the horizontal card structure with unavailable metadata and sibling controls", () => {
    const markup = renderToStaticMarkup(
      createElement(GameCard, {
        authStatus: "anonymous",
        game: { ...game, platforms: [], rating: null, released: null },
        messages: messages.en,
        onSave,
        onSelect: () => undefined,
      }),
    );

    expect(markup).toContain('data-variant="card"');
    expect(markup).toContain(
      'aria-label="Position: Unavailable; Rating / 100: Unavailable; Year: Unavailable; Platforms: Unavailable"',
    );
    expect(markup).toContain('aria-label="Open details for A Short Hike"');
    expect(markup).toContain(
      'aria-label="Sign in to save A Short Hike to favorites"',
    );
    expect(markup.match(/<button/g)).toHaveLength(2);
    expect(markup.indexOf("<button")).toBeLessThan(markup.indexOf("</button>"));
    expect(markup).toContain("72px");
  });
});
