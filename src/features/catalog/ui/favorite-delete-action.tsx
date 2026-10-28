import { useState, type FocusEvent } from "react";

import type { FavoriteCreateInput } from "@/features/favorites/model/game";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";

type FavoriteDeleteActionProps = {
  game: FavoriteCreateInput;
  messages: Messages;
  onDelete: (igdbId: number) => Promise<void>;
  placement: "card" | "modal";
};

type DeleteState = "confirming" | "error" | "idle" | "removing";
export function FavoriteDeleteAction({
  game,
  messages,
  onDelete,
  placement,
}: FavoriteDeleteActionProps) {
  const [deleteState, setDeleteState] = useState<DeleteState>("idle");
  const copy = messages.catalog.favorite;
  const name = game.name;
  const actionLabel = copy.removeAction.replace("{name}", name);
  const removingLabel = copy.removing.replace("{name}", name);
  const errorLabel = copy.removeError.replace("{name}", name);
  const isConfirming = deleteState === "confirming";
  const isRemoving = deleteState === "removing";

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (
      isConfirming &&
      !event.currentTarget.contains(event.relatedTarget as Node | null)
    ) {
      setDeleteState("idle");
    }
  };

  const confirmDelete = () => {
    if (isRemoving) {
      return;
    }

    setDeleteState("removing");
    void onDelete(game.igdbId)
      .then(() => setDeleteState("idle"))
      .catch(() => setDeleteState("error"));
  };

  return (
    <div
      className={placement === "modal" ? "relative z-10 mt-4" : undefined}
      onBlur={handleBlur}
    >
      <IconButton
        aria-expanded={isConfirming}
        aria-label={actionLabel}
        className="text-copper-strong"
        data-saved="true"
        disabled={isRemoving}
        onClick={() => setDeleteState("confirming")}
        type="button"
      >
        <HeartIcon isSaved />
      </IconButton>
      {isConfirming || isRemoving || deleteState === "error" ? (
        <div
          aria-label={copy.removeConfirm}
          className={`z-10 rounded-panel border border-border bg-paper-raised p-3 text-ink shadow-lg ${placement === "card" ? "absolute inset-x-0 top-full mt-2" : "relative mt-2 w-[min(220px,calc(100vw-32px))]"}`}
          role="group"
        >
          <p className="mb-2.5 font-ui text-xs leading-relaxed text-ink-secondary">
            {copy.removeConfirmDescription.replace("{name}", name)}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              className="px-2.5 text-xs"
              disabled={isRemoving}
              onClick={() => setDeleteState("idle")}
              variant="ghost"
            >
              {copy.removeCancel}
            </Button>
            <Button
              aria-busy={isRemoving}
              className="px-2.5 text-xs"
              disabled={isRemoving}
              onClick={confirmDelete}
              variant="primary"
            >
              {isRemoving ? (
                <>
                  <span
                    aria-hidden="true"
                    className="inline-block size-3 shrink-0 animate-[catalog-suggestion-search_700ms_linear_infinite] rounded-full border-2 border-current/30 border-t-copper motion-reduce:animate-none"
                  />
                  {removingLabel}
                </>
              ) : (
                copy.removeConfirmAction
              )}
            </Button>
          </div>
          {deleteState === "error" ? (
            <span
              className="mt-2 block font-ui text-xs text-danger"
              role="alert"
            >
              {errorLabel}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function HeartIcon({ isSaved }: { isSaved: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      data-saved={isSaved}
      fill={isSaved ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M20.8 8.7c0 5.1-8.8 10.4-8.8 10.4S3.2 13.8 3.2 8.7A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7Z" />
    </svg>
  );
}
