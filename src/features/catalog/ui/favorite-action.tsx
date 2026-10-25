"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { AuthStatus } from "@/features/auth/ui/auth-provider";
import type { FavoriteCreateInput } from "@/features/favorites/model/game";
import { HeartIcon } from "@/features/catalog/ui/favorite-delete-action";
import {
  nextFavoriteSaveState,
  type FavoriteSaveState as SaveState,
} from "@/features/catalog/ui/favorite-save-state";
import { ApiClientError } from "@/shared/api/http";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";

export { FavoriteDeleteAction } from "@/features/catalog/ui/favorite-delete-action";
export { nextFavoriteSaveState } from "@/features/catalog/ui/favorite-save-state";

type FavoriteActionProps = {
  favoriteStatus?: "loading" | "ready";
  game: FavoriteCreateInput;
  messages: Messages;
  onSave: (game: FavoriteCreateInput) => Promise<void>;
  placement: "card" | "modal";
  status: AuthStatus;
};

export function FavoriteAction({
  favoriteStatus = "ready",
  game,
  messages,
  onSave,
  placement,
  status,
}: FavoriteActionProps) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const portalRoot = typeof document === "undefined" ? null : document.body;
  const actionRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const popoverId = `favorite-action-${useId()}`;
  const isAnonymous = status === "anonymous";
  const isLoading = status === "loading" || favoriteStatus === "loading";
  const isSaving = saveState === "saving";
  const isSaved = saveState === "saved";
  const isOpen = saveState === "confirming";
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
    if (isLoading || isSaving || isSaved) return;
    setSaveState(nextFavoriteSaveState(status, saveState, "activate"));
  };

  const confirmSave = () => {
    const nextState = nextFavoriteSaveState(status, saveState, "confirm");
    if (nextState !== "saving") return;
    setSaveState(nextState);
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

  useLayoutEffect(() => {
    if (!isOpen || !portalRoot) return;

    const positionPopover = () => {
      const trigger = actionRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;
      const bounds = trigger.getBoundingClientRect();
      const width = Math.min(280, window.innerWidth - 32);
      const height = panel.getBoundingClientRect().height;
      const left = Math.max(
        16,
        Math.min(bounds.right - width, window.innerWidth - width - 16),
      );
      const below = bounds.bottom + 8;
      const top =
        below + height <= window.innerHeight - 16
          ? below
          : Math.max(16, bounds.top - height - 8);
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      panel.style.width = `${width}px`;
      panel.style.visibility = "visible";
    };

    positionPopover();
    panelRef.current
      ?.querySelector<HTMLElement>("a[href], button:not([disabled])")
      ?.focus();
    window.addEventListener("resize", positionPopover);
    window.addEventListener("scroll", positionPopover, true);

    const closeAndReturnFocus = () => {
      setSaveState((current) =>
        nextFavoriteSaveState(status, current, "outside"),
      );
      window.requestAnimationFrame(() => actionRef.current?.focus());
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !panelRef.current?.contains(target) &&
        !actionRef.current?.contains(target)
      )
        closeAndReturnFocus();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAndReturnFocus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", positionPopover);
      window.removeEventListener("scroll", positionPopover, true);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, portalRoot, status]);

  return (
    <div className={`relative z-10 ${placement === "modal" ? "mt-4" : ""}`}>
      <IconButton
        aria-controls={popoverId}
        aria-expanded={isOpen}
        aria-label={label}
        className={isSaved ? "text-copper-strong" : ""}
        data-saved={isSaved}
        data-saving={isSaving}
        disabled={isLoading || isSaving || isSaved}
        onClick={handleAction}
        pressed={isSaved}
        ref={actionRef}
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
      {isOpen && portalRoot
        ? createPortal(
            <div
              aria-label={
                isAnonymous
                  ? messages.catalog.favorite.anonymousPrompt
                  : messages.catalog.favorite.saveConfirm.replace(
                      "{name}",
                      game.name,
                    )
              }
              className="fixed z-[70] max-h-[calc(100dvh-32px)] overflow-y-auto rounded-panel border border-border bg-paper-raised p-3 font-ui text-sm text-ink shadow-raised"
              data-favorite-popover
              id={popoverId}
              ref={panelRef}
              role={isAnonymous ? "region" : "group"}
              style={{
                left: 16,
                top: 16,
                visibility: "hidden",
                width: "min(280px, calc(100vw - 32px))",
              }}
            >
              {isAnonymous ? (
                <>
                  <p className="mb-2 text-xs leading-5 text-ink-secondary">
                    {messages.catalog.favorite.anonymousPrompt}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <a
                      className="min-h-11 inline-flex items-center font-medium text-copper-strong underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-focus"
                      href="/login"
                    >
                      {messages.catalog.favorite.signInLink}
                    </a>
                    <a
                      className="min-h-11 inline-flex items-center font-medium text-copper-strong underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-focus"
                      href="/register"
                    >
                      {messages.catalog.favorite.createAccountLink}
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-2.5 text-xs leading-relaxed text-ink-secondary">
                    {messages.catalog.favorite.saveConfirmDescription.replace(
                      "{name}",
                      game.name,
                    )}
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      className="px-2.5 text-xs"
                      onClick={() => {
                        setSaveState((current) =>
                          nextFavoriteSaveState(status, current, "cancel"),
                        );
                        actionRef.current?.focus();
                      }}
                      variant="ghost"
                    >
                      {messages.catalog.favorite.saveCancel}
                    </Button>
                    <Button
                      className="px-2.5 text-xs"
                      onClick={confirmSave}
                      variant="primary"
                    >
                      {messages.catalog.favorite.saveConfirmAction}
                    </Button>
                  </div>
                </>
              )}
            </div>,
            portalRoot,
          )
        : null}
      {saveState === "error" || saveState === "duplicate" ? (
        <span
          className="absolute right-0 top-full mt-2 flex w-max max-w-[240px] items-start gap-2 rounded-control border border-border bg-paper-raised p-3 font-ui text-xs leading-5 text-ink shadow-raised"
          role="alert"
        >
          <span
            aria-hidden="true"
            className="mt-0.5 size-2 shrink-0 rounded-full bg-danger"
          />
          {saveState === "duplicate" ? duplicateLabel : errorLabel}
        </span>
      ) : null}
    </div>
  );
}
