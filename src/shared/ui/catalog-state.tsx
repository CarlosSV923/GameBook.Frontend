import type { Messages } from "@/shared/i18n/messages";

import { IndexStrip } from "@/shared/ui/index-strip";

export type CatalogStateKind = "empty" | "error" | "loading";

type CatalogStateProps = {
  context?: "catalog" | "favorites";
  emptyMode?: "initial" | "noResults";
  kind: CatalogStateKind;
  messages: Messages;
  onRetry?: () => void;
};

export function CatalogState({
  context = "catalog",
  emptyMode = "initial",
  kind,
  messages,
  onRetry,
}: CatalogStateProps) {
  const sectionCopy =
    context === "favorites" ? messages.favorites : messages.catalog;
  const content = {
    empty: {
      description:
        emptyMode === "noResults"
          ? messages.states.noResultsDescription
          : sectionCopy.emptyDescription,
      title:
        emptyMode === "noResults"
          ? messages.states.noResultsTitle
          : sectionCopy.emptyTitle,
    },
    error: {
      description:
        context === "favorites"
          ? messages.favorites.errorDescription
          : messages.states.errorDescription,
      title:
        context === "favorites"
          ? messages.favorites.errorTitle
          : messages.states.errorTitle,
    },
    loading: {
      description: sectionCopy.description,
      title:
        context === "favorites"
          ? messages.favorites.loading
          : messages.states.loading,
    },
  }[kind];

  return (
    <div
      aria-live={kind === "loading" ? "polite" : "assertive"}
      className={`catalog-state catalog-state--${kind}`}
      role={kind === "error" ? "alert" : undefined}
    >
      <IndexStrip labels={messages.indexStrip} />
      <div className="catalog-state__content">
        <p className="catalog-state__kicker">{sectionCopy.eyebrow}</p>
        <h3>{content.title}</h3>
        <p>{content.description}</p>
        {kind === "error" && onRetry ? (
          <button className="text-button" onClick={onRetry} type="button">
            {messages.states.retry}
          </button>
        ) : null}
      </div>
      {kind === "loading" ? (
        <span className="catalog-state__marker" aria-hidden="true" />
      ) : null}
    </div>
  );
}
