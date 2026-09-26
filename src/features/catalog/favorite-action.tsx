"use client";

import { useRouter } from "next/navigation";
import { useState, type FocusEvent } from "react";

import type { AuthStatus } from "@/features/auth/auth-provider";
import type { FavoriteCreateInput } from "@/shared/api/game";
import { ApiClientError } from "@/shared/api/http";
import type { Messages } from "@/shared/i18n/messages";

type FavoriteActionProps = {
  game: FavoriteCreateInput;
  messages: Messages;
  onSave: (game: FavoriteCreateInput) => Promise<void>;
  placement: "card" | "modal";
  status: AuthStatus;
};

type SaveState = "duplicate" | "error" | "idle" | "saved" | "saving";

type FavoriteDeleteActionProps = {
  game: FavoriteCreateInput;
  messages: Messages;
  onDelete: (igdbId: number) => Promise<void>;
  placement: "card" | "modal";
};

type DeleteState = "confirming" | "error" | "idle" | "removing";

export function FavoriteAction({
  game,
  messages,
  onSave,
  placement,
  status,
}: FavoriteActionProps) {
  const router = useRouter();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const isAnonymous = status === "anonymous";
  const isLoading = status === "loading";
  const isSaving = saveState === "saving";
  const isSaved = saveState === "saved";
  const actionLabel = messages.catalog.favorite.action.replace(
    "{name}",
    game.name,
  );
  const signInLabel = messages.catalog.favorite.signIn.replace(
    "{name}",
    game.name,
  );
  const savingLabel = messages.catalog.favorite.saving.replace(
    "{name}",
    game.name,
  );
  const savedLabel = messages.catalog.favorite.saved.replace(
    "{name}",
    game.name,
  );
  const errorLabel = messages.catalog.favorite.error.replace(
    "{name}",
    game.name,
  );
  const duplicateLabel = messages.catalog.favorite.duplicate.replace(
    "{name}",
    game.name,
  );
  const label = isLoading
    ? messages.catalog.favorite.loading
    : isAnonymous
      ? signInLabel
      : isSaving
        ? savingLabel
        : isSaved
          ? savedLabel
          : saveState === "duplicate"
            ? duplicateLabel
            : saveState === "error"
              ? errorLabel
              : actionLabel;

  const handleAction = () => {
    if (isLoading || isSaving || isSaved) {
      return;
    }

    if (isAnonymous) {
      router.push("/login");
      return;
    }

    setSaveState("saving");
    void onSave(game)
      .then(() => setSaveState("saved"))
      .catch((error: unknown) =>
        setSaveState(
          error instanceof ApiClientError &&
            error.code === "FAVORITE_ALREADY_EXISTS"
            ? "duplicate"
            : "error",
        ),
      );
  };

  return (
    <div className={`favorite-action favorite-action--${placement}`}>
      <button
        aria-label={label}
        aria-pressed={isSaved}
        className="favorite-action__button"
        data-saved={isSaved}
        data-saving={isSaving}
        disabled={isLoading || isSaving || isSaved}
        onClick={handleAction}
        type="button"
      >
        {isSaving ? (
          <span
            aria-hidden="true"
            className="loading-spinner loading-spinner--small"
          />
        ) : (
          <HeartIcon isSaved={isSaved} />
        )}
      </button>
      {saveState === "error" || saveState === "duplicate" ? (
        <span className="favorite-action__status" role="alert">
          {saveState === "duplicate" ? duplicateLabel : errorLabel}
        </span>
      ) : null}
    </div>
  );
}

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
      className={`favorite-action favorite-action--${placement}`}
      onBlur={handleBlur}
    >
      <button
        aria-expanded={isConfirming}
        aria-label={actionLabel}
        className="favorite-action__button"
        data-saved="true"
        disabled={isRemoving}
        onClick={() => setDeleteState("confirming")}
        type="button"
      >
        <HeartIcon isSaved />
      </button>
      {isConfirming || isRemoving || deleteState === "error" ? (
        <div
          aria-label={copy.removeConfirm}
          className="favorite-action__confirmation"
          role="group"
        >
          <p>{copy.removeConfirmDescription.replace("{name}", name)}</p>
          <div className="favorite-action__confirmation-actions">
            <button
              className="favorite-action__cancel"
              disabled={isRemoving}
              onClick={() => setDeleteState("idle")}
              type="button"
            >
              {copy.removeCancel}
            </button>
            <button
              aria-busy={isRemoving}
              className="favorite-action__confirm"
              disabled={isRemoving}
              onClick={confirmDelete}
              type="button"
            >
              {isRemoving ? (
                <>
                  <span
                    aria-hidden="true"
                    className="loading-spinner loading-spinner--small"
                  />
                  {removingLabel}
                </>
              ) : (
                copy.removeConfirmAction
              )}
            </button>
          </div>
          {deleteState === "error" ? (
            <span className="favorite-action__status" role="alert">
              {errorLabel}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function HeartIcon({ isSaved }: { isSaved: boolean }) {
  return (
    <svg aria-hidden="true" data-saved={isSaved} viewBox="0 0 24 24">
      <path d="M20.8 8.7c0 5.1-8.8 10.4-8.8 10.4S3.2 13.8 3.2 8.7A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7Z" />
    </svg>
  );
}
