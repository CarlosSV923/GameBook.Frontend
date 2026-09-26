"use client";

import Image from "next/image";
import { useState } from "react";

import type { AuthStatus } from "@/features/auth/auth-provider";
import {
  FavoriteAction,
  FavoriteDeleteAction,
} from "@/features/catalog/favorite-action";
import {
  formatGamePlatforms,
  formatGameRating,
  formatGameYear,
} from "@/features/catalog/game-card-formatting";
import type { FavoriteCreateInput } from "@/shared/api/game";
import type { IgdbGameCard as IgdbGameCardData } from "@/shared/api/igdb";
import type { Messages } from "@/shared/i18n/messages";

type GameCardProps = {
  game: IgdbGameCardData;
  messages: Messages;
  onDelete?: (igdbId: number) => Promise<void>;
  onSave?: (game: FavoriteCreateInput) => Promise<void>;
  onSelect: () => void;
  authStatus: AuthStatus;
};

export function GameCard({
  authStatus,
  game,
  messages,
  onDelete,
  onSave,
  onSelect,
}: GameCardProps) {
  const [imageUrl, setImageUrl] = useState(game.imageUrl);
  const titleId = `game-card-${game.igdbId}`;
  const coverAlt = messages.catalog.coverAlt.replace("{name}", game.name);

  return (
    <article aria-labelledby={titleId} className="game-card">
      <button
        aria-label={messages.catalog.detail.open.replace("{name}", game.name)}
        className="game-card__trigger"
        onClick={onSelect}
        type="button"
      >
        <span className="game-card__media">
          {imageUrl ? (
            <Image
              alt={coverAlt}
              className="game-card__image"
              fill
              onError={() => setImageUrl(null)}
              sizes="(max-width: 480px) 100vw, (max-width: 720px) 40vw, (max-width: 980px) 30vw, 20vw"
              src={imageUrl}
            />
          ) : (
            <span
              aria-label={messages.catalog.missingImage}
              className="game-card__fallback"
              title={messages.catalog.missingImage}
              role="img"
            >
              <span aria-hidden="true">
                {game.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="game-card__fallback-label">
                {messages.catalog.missingImage}
              </span>
            </span>
          )}
        </span>
        <span className="game-card__content">
          <span
            aria-level={3}
            className="game-card__title"
            id={titleId}
            role="heading"
          >
            {game.name}
          </span>
          <span className="game-card__details">
            <span
              aria-label={`${messages.indexStrip.rating}: ${formatGameRating(game.rating)}`}
              className={`game-card__rating${game.rating === null ? " game-card__rating--missing" : ""}`}
            >
              <StarIcon />
              <span>{formatGameRating(game.rating)}</span>
            </span>
            <span
              aria-label={`${messages.indexStrip.year}: ${formatGameYear(game.released)}; ${messages.indexStrip.platforms}: ${formatGamePlatforms(game.platforms)}`}
              className="game-card__subline"
              title={formatGamePlatforms(game.platforms)}
            >
              <span>{formatGameYear(game.released)}</span>
              <span aria-hidden="true">•</span>
              <span className="game-card__platforms">
                {formatGamePlatforms(game.platforms)}
              </span>
            </span>
          </span>
        </span>
      </button>
      {onDelete ? (
        <FavoriteDeleteAction
          game={game}
          messages={messages}
          onDelete={onDelete}
          placement="card"
        />
      ) : onSave ? (
        <FavoriteAction
          game={game}
          messages={messages}
          onSave={onSave}
          placement="card"
          status={authStatus}
        />
      ) : null}
    </article>
  );
}

function StarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m12 3.5 2.6 5.2 5.8.8-4.2 4 1 5.7-5.2-2.7-5.2 2.7 1-5.7-4.2-4 5.8-.8L12 3.5Z" />
    </svg>
  );
}
