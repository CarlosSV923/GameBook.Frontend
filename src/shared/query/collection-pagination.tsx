import type { MouseEvent } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { CatalogState } from "@/shared/ui/catalog-state";
import { Button } from "@/shared/ui/button";

export function CollectionPagination({
  context = "catalog",
  fetching,
  hasNext,
  error,
  messages,
  onNext,
}: {
  context?: "catalog" | "favorites";
  fetching: boolean;
  hasNext: boolean;
  error: boolean;
  messages: Messages;
  onNext: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="mt-6 grid min-h-[42px] justify-items-center gap-2.5"
    >
      {fetching ? (
        <p
          className="m-0 inline-flex items-center text-center text-xs leading-[1.4] text-ink-muted"
          role="status"
        >
          <span
            aria-hidden="true"
            className="mr-2 inline-block size-3.5 shrink-0 animate-[catalog-suggestion-search_700ms_linear_infinite] rounded-full border-2 border-current/30 border-t-copper align-[-2px] motion-reduce:animate-none"
          />
          {messages.states.loadingMore}
        </p>
      ) : null}
      {error ? (
        <div
          className="flex flex-wrap items-center justify-center gap-3 text-center text-[0.8125rem] text-danger"
          role="alert"
        >
          <p>{messages.states.paginationError}</p>
          <Button
            className="min-w-[120px]"
            onClick={onNext}
            variant="secondary"
          >
            {messages.states.retry}
          </Button>
        </div>
      ) : null}
      {!fetching && !error && hasNext ? (
        <Button className="min-w-[120px]" onClick={onNext} variant="primary">
          {messages.states.loadMore}
        </Button>
      ) : null}
      {!fetching && !error && !hasNext ? (
        <CatalogState context={context} kind="end" messages={messages} />
      ) : null}
    </div>
  );
}
