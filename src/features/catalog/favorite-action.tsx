"use client";

import Link from "next/link";
import { useState } from "react";

import type { AuthStatus } from "@/features/auth/auth-provider";
import type { Messages } from "@/shared/i18n/messages";

type FavoriteActionProps = {
  gameId: number;
  gameName: string;
  messages: Messages;
  placement: "card" | "modal";
  status: AuthStatus;
};

export function FavoriteAction({
  gameId,
  gameName,
  messages,
  placement,
  status,
}: FavoriteActionProps) {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const isAnonymous = status === "anonymous";
  const isLoading = status === "loading";
  const promptId = `favorite-prompt-${placement}-${gameId}`;
  const actionLabel = messages.catalog.favorite.action.replace(
    "{name}",
    gameName,
  );

  const handleAction = () => {
    if (isAnonymous) {
      setIsPromptOpen((open) => !open);
    }
  };

  return (
    <div className={`favorite-action favorite-action--${placement}`}>
      <button
        aria-controls={isAnonymous ? promptId : undefined}
        aria-expanded={isAnonymous ? isPromptOpen : undefined}
        aria-label={isLoading ? messages.catalog.favorite.loading : actionLabel}
        className="favorite-action__button"
        disabled={isLoading}
        onClick={handleAction}
        type="button"
      >
        <HeartIcon />
      </button>
      {isAnonymous && isPromptOpen ? (
        <div
          aria-label={messages.catalog.favorite.prompt}
          className="favorite-action__prompt"
          id={promptId}
          role="dialog"
        >
          <p className="favorite-action__prompt-title">
            {messages.catalog.favorite.prompt}
          </p>
          <p className="favorite-action__prompt-description">
            {messages.catalog.favorite.promptDescription}
          </p>
          <div className="favorite-action__prompt-actions">
            <Link className="favorite-action__link" href="/login">
              {messages.navigation.signIn}
            </Link>
            <Link className="favorite-action__link" href="/register">
              {messages.navigation.createAccount}
            </Link>
          </div>
          <button
            className="favorite-action__dismiss"
            onClick={() => setIsPromptOpen(false)}
            type="button"
          >
            {messages.catalog.favorite.dismiss}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function HeartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20.8 8.7c0 5.1-8.8 10.4-8.8 10.4S3.2 13.8 3.2 8.7A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7Z" />
    </svg>
  );
}
