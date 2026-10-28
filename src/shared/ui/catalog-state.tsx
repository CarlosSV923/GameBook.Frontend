import type { Messages } from "@/shared/i18n/messages";

import { IndexStrip } from "@/shared/ui/index-strip";

export type CatalogStateKind = "empty" | "end" | "error" | "loading";

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
    end: {
      description: messages.states.endOfResults,
      title: sectionCopy.title,
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
      className="grid grid-cols-2 gap-x-3 gap-y-5 min-[481px]:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] min-[768px]:gap-x-5 min-[768px]:gap-y-6"
      role="status"
    >
      <span className="sr-only">{content.title}</span>
      {Array.from({ length: 10 }, (_, index) => (
        <div aria-hidden="true" className="grid gap-2.5" key={index}>
          <span className="aspect-[3/4] w-full animate-pulse rounded-card border border-border-soft bg-paper-inset motion-reduce:animate-none" />
          <span className="grid min-h-[3.75rem] content-start gap-2 pr-9">
            <span className="h-4 w-4/5 animate-pulse rounded bg-paper-inset motion-reduce:animate-none" />
            <span className="h-3 w-3/5 animate-pulse rounded bg-paper-inset motion-reduce:animate-none" />
          </span>
        </div>
      ))}
    </div>
  ) : (
    <div
      aria-live={kind === "end" ? "polite" : "assertive"}
      className={`grid rounded-panel border border-border-soft bg-paper-raised shadow-raised ${kind === "end" ? "grid-cols-[8px_minmax(0,1fr)] items-center gap-4 px-5 py-4" : "min-h-48 grid-cols-[72px_minmax(0,1fr)] gap-5 p-5 sm:min-h-52 sm:grid-cols-[92px_minmax(0,1fr)] sm:gap-6 sm:p-6"} ${kind === "error" ? "border-danger/40" : ""}`}
      role={kind === "error" ? "alert" : kind === "end" ? "status" : undefined}
    >
      {kind === "end" ? (
        <span
          aria-hidden="true"
          className="h-8 w-2 rounded-full bg-copper/70"
        />
      ) : (
        <IndexStrip labels={messages.indexStrip} />
      )}
      <div className="self-center">
        <p className="mb-2 font-ui text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-copper-strong">
          {sectionCopy.eyebrow}
        </p>
        {kind === "end" ? (
          <p className="m-0 max-w-[44ch] text-sm leading-6 text-ink-secondary">
            {content.description}
          </p>
        ) : (
          <>
            <h3 className="mb-3 max-w-[18ch] font-display text-2xl font-medium leading-tight tracking-tight text-ink">
              {content.title}
            </h3>
            <p className="mb-0 max-w-[44ch] text-sm leading-6 text-ink-secondary">
              {content.description}
            </p>
          </>
        )}
        {kind === "error" && onRetry ? (
          <button
            className="mt-4 min-h-11 rounded-control border border-border bg-paper-inset px-4 text-sm font-semibold text-ink hover:border-copper focus-visible:outline-3 focus-visible:outline-focus focus-visible:outline-offset-2"
            onClick={onRetry}
            type="button"
          >
            {messages.states.retry}
          </button>
        ) : null}
      </div>
    </div>
  );
}
