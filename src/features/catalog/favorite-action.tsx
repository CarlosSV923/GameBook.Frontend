"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { AuthStatus } from "@/features/auth/auth-provider";
import type { FavoriteCreateInput } from "@/shared/api/game";
import type { Messages } from "@/shared/i18n/messages";

type FavoriteActionProps = {
  game: FavoriteCreateInput;
  messages: Messages;
  onSave: (game: FavoriteCreateInput) => Promise<void>;
  placement: "card" | "modal";
  status: AuthStatus;
};

type SaveState = "error" | "idle" | "saved" | "saving";

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
  const label = isLoading
    ? messages.catalog.favorite.loading
    : isAnonymous
      ? signInLabel
      : isSaving
        ? savingLabel
        : isSaved
          ? savedLabel
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
      .catch(() => setSaveState("error"));
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
        <HeartIcon isSaved={isSaved} />
      </button>
      {saveState === "error" ? (
        <span className="favorite-action__status" role="alert">
          {errorLabel}
        </span>
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
