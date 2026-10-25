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

  return kind === "loading" ? (
    <div
      aria-live="polite"
      className="grid grid-cols-1 gap-3 min-[768px]:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] min-[768px]:gap-5"
      role="status"
    >
      <span className="sr-only">{content.title}</span>
      {Array.from({ length: 6 }, (_, index) => (
        <div
          aria-hidden="true"
          className="flex min-h-[148px] overflow-hidden rounded-panel border border-border bg-paper-raised"
          key={index}
        >
          <IndexStrip labels={messages.indexStrip} variant="card" />
          <div className="flex min-w-0 flex-1 items-center gap-3 p-3">
            <span className="hidden aspect-[4/3] w-28 shrink-0 animate-pulse rounded-control bg-paper-inset min-[768px]:block motion-reduce:animate-none" />
            <span className="-my-3 -ml-3 w-[72px] shrink-0 animate-pulse bg-paper-inset min-[768px]:hidden motion-reduce:animate-none" />
            <span className="grid min-w-0 flex-1 gap-3">
              <span className="h-4 w-4/5 animate-pulse rounded bg-paper-inset motion-reduce:animate-none" />
              <span className="h-3 w-3/5 animate-pulse rounded bg-paper-inset motion-reduce:animate-none" />
            </span>
            <span className="size-11 shrink-0 rounded-full bg-paper-inset" />
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div
      aria-live="assertive"
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
    </div>
  );
}
