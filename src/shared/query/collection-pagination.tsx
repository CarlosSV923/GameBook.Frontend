import type { MouseEvent } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { CatalogState } from "@/shared/ui/catalog-state";

export function CollectionPagination({
  fetching,
  hasNext,
  error,
  messages,
  onNext,
}: {
  fetching: boolean;
  hasNext: boolean;
  error: boolean;
  messages: Messages;
  onNext: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div aria-live="polite" className="catalog-pagination">
      {fetching ? (
        <p className="catalog-pagination__status" role="status">
          <span aria-hidden="true" className="loading-spinner" />
          {messages.states.loadingMore}
        </p>
      ) : null}
      {error ? (
        <div className="catalog-pagination__error" role="alert">
          <p>{messages.states.paginationError}</p>
          <button
            className="catalog-filter-button catalog-filter-button--quiet"
            onClick={onNext}
            type="button"
          >
            {messages.states.retry}
          </button>
        </div>
      ) : null}
      {!fetching && !error && hasNext ? (
        <button
          className="catalog-filter-button catalog-pagination__button"
          onClick={onNext}
          type="button"
        >
          {messages.states.loadMore}
        </button>
      ) : null}
      {!fetching && !error && !hasNext ? (
        <CatalogState kind="end" messages={messages} />
      ) : null}
    </div>
  );
}
