"use client";

import { useRouter } from "next/navigation";
import { useState, type FocusEvent } from "react";

import type { AuthStatus } from "@/features/auth/ui/auth-provider";
import type { FavoriteCreateInput } from "@/features/favorites/model/game";
import { ApiClientError } from "@/shared/api/http";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";

type FavoriteActionProps = {
  favoriteStatus?: "loading" | "ready";
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
  favoriteStatus = "ready",
  game,
  messages,
  onSave,
  placement,
  status,
}: FavoriteActionProps) {
  const router = useRouter();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const isAnonymous = status === "anonymous";
  const isLoading = status === "loading" || favoriteStatus === "loading";
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
    <div className={`relative z-10 ${placement === "modal" ? "mt-4" : ""}`}>
      <IconButton
        aria-label={label}
        className={isSaved ? "text-copper-strong" : ""}
        data-saved={isSaved}
        data-saving={isSaving}
        disabled={isLoading || isSaving || isSaved}
        onClick={handleAction}
        pressed={isSaved}
      >
        {isSaving ? (
          <span
            aria-hidden="true"
            className="loading-spinner loading-spinner--small"
          />
        ) : (
          <HeartIcon isSaved={isSaved} />
        )}
      </IconButton>
      {saveState === "error" || saveState === "duplicate" ? (
        <span
          className="absolute right-0 top-full mt-2 w-max max-w-[220px] rounded-control border border-border bg-paper-raised p-2 font-ui text-xs leading-snug text-danger shadow-md"
          role="alert"
        >
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
      className={`relative z-10 ${placement === "modal" ? "mt-4" : ""}`}
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
          className={`z-20 w-[min(220px,calc(100vw-32px))] rounded-panel border border-border bg-paper-raised p-3 text-ink shadow-lg ${placement === "card" ? "absolute right-0 top-full mt-2" : "relative mt-2"}`}
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
              variant="secondary"
            >
              {copy.removeCancel}
            </Button>
            <Button
              aria-busy={isRemoving}
              className="bg-copper-strong px-2.5 text-xs text-white hover:brightness-95"
              disabled={isRemoving}
              onClick={confirmDelete}
              variant="primary"
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

function HeartIcon({ isSaved }: { isSaved: boolean }) {
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
