import type { Messages } from "@/shared/i18n/messages";

import { IndexStrip } from "@/shared/ui/index-strip";

export type CatalogStateKind = "empty" | "error" | "loading";

type CatalogStateProps = {
  emptyMode?: "initial" | "noResults";
  kind: CatalogStateKind;
  messages: Messages;
  onRetry?: () => void;
};

export function CatalogState({
  emptyMode = "initial",
  kind,
  messages,
  onRetry,
}: CatalogStateProps) {
  const content = {
    empty: {
      description:
        emptyMode === "noResults"
          ? messages.states.noResultsDescription
          : messages.catalog.emptyDescription,
      title:
        emptyMode === "noResults"
          ? messages.states.noResultsTitle
          : messages.catalog.emptyTitle,
    },
    error: {
      description: messages.states.errorDescription,
      title: messages.states.errorTitle,
    },
    loading: {
      description: messages.catalog.description,
      title: messages.states.loading,
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
        <p className="catalog-state__kicker">{messages.catalog.eyebrow}</p>
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
