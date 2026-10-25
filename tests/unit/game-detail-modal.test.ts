import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GameDetailModal } from "@/features/catalog/ui/game-detail-modal";
import { messages } from "@/shared/i18n/messages";
import { useQuery } from "@tanstack/react-query";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

const game = {
  igdbId: 42,
  imageUrl: null,
  name: "Example Quest",
  platforms: [{ id: 6, name: "PC" }],
  rating: 92.4,
  released: "2015-06-12",
};

const detail = {
  ...game,
  developers: ["Example Studio"],
  genres: ["Adventure"],
  releaseDatePrecision: "day" as const,
  screenshots: [],
  summary: "A compact modal fixture.",
};

function renderModal() {
  return renderToStaticMarkup(
    createElement(GameDetailModal, {
      authStatus: "anonymous",
      game,
      messages: messages.en,
      onClose: () => undefined,
      position: 4,
    }),
  );
}

describe("GameDetailModal", () => {
  beforeEach(() => {
    vi.mocked(useQuery).mockReturnValue({
      data: detail,
      isError: false,
      isPending: false,
    } as never);
  });

  it("renders a labelled modal, close control, and detail strip values", () => {
    const markup = renderModal();

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain('aria-labelledby="game-detail-title"');
    expect(markup).toContain('<h2 class="');
    expect(markup).toContain('id="game-detail-title">Example Quest</h2>');
    expect(markup).toContain('aria-label="Close game details"');
    expect(markup).toContain('data-variant="detail"');
    expect(markup).toContain(
      'aria-label="Position: #4; Rating / 100: 92; Year: 2015; Platforms: PC"',
    );
  });

  it("keeps the game card and shows an unavailable state when IGDB has no detail", () => {
    vi.mocked(useQuery).mockReturnValue({
      data: null,
      isError: false,
      isPending: false,
    } as never);

    const markup = renderModal();

    expect(markup).toContain('role="status"');
    expect(markup).toContain("Details are not available for this game");
    expect(markup).toContain('aria-labelledby="game-detail-title"');
    expect(markup).toContain('data-variant="detail"');
  });
});
