"use client";

import Image from "next/image";
import { useState } from "react";

import type { AuthStatus } from "@/features/auth/ui/auth-provider";
import {
  FavoriteAction,
  FavoriteDeleteAction,
} from "@/features/catalog/ui/favorite-action";
import type { FavoriteCreateInput } from "@/features/favorites/model/game";
import type { IgdbGameCard as IgdbGameCardData } from "@/features/catalog/model/igdb";
import type { Messages } from "@/shared/i18n/messages";

type GameCardProps = {
  game: IgdbGameCardData;
  messages: Messages;
  favoriteStatus?: "loading" | "ready";
  isFavorite?: boolean;
  onDelete?: (igdbId: number) => Promise<void>;
  onSave?: (game: FavoriteCreateInput) => Promise<void>;
  onSelect: () => void;
  authStatus: AuthStatus;
};

// Poster card: a 3:4 cover (IGDB covers are 3:4) with the rating badge on
// top, then the title, the favorite action and one "year · platforms" line.
export function GameCard({
  authStatus,
  favoriteStatus = "ready",
  game,
  isFavorite = false,
  messages,
  onDelete,
  onSave,
  onSelect,
}: GameCardProps) {
  const [imageUrl, setImageUrl] = useState(game.imageUrl);
  const titleId = `game-card-${game.igdbId}`;
  const coverAlt = messages.catalog.coverAlt.replace("{name}", game.name);
  const unavailable = messages.indexStrip.unavailable;
  const year = game.released?.slice(0, 4) || unavailable;
  const platforms = game.platforms.length
    ? game.platforms.map(({ name }) => name).join(" · ")
    : unavailable;
  const meta = `${year} · ${platforms}`;
  const rating =
    typeof game.rating === "number" &&
    Number.isFinite(game.rating) &&
    game.rating >= 0 &&
    game.rating <= 100
      ? String(Math.round(game.rating))
      : null;

  return (
    <article
      aria-labelledby={titleId}
      className="group relative flex h-full min-w-0 flex-col gap-2.5"
      data-game-card
    >
      <button
        aria-label={messages.catalog.detail.open.replace("{name}", game.name)}
        className="relative block aspect-[3/4] w-full overflow-hidden rounded-card border border-border-soft bg-paper-inset shadow-sm transition-shadow outline-none group-hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
        onClick={onSelect}
        type="button"
      >
        {imageUrl ? (
          <Image
            alt={coverAlt}
            className="object-cover"
            fill
            onError={() => setImageUrl(null)}
            sizes="(max-width: 480px) 50vw, 240px"
            src={imageUrl}
          />
        ) : (
          <span
            aria-label={messages.catalog.missingImage}
            className="grid size-full place-items-center font-display text-5xl text-copper-strong/70"
            role="img"
          >
            <span>{game.name.slice(0, 1).toUpperCase()}</span>
          </span>
        )}
      </button>
      <span
        aria-label={`${messages.indexStrip.rating}: ${rating ?? unavailable}`}
        className="pointer-events-none absolute left-2 top-2 rounded-control border border-border-soft bg-paper-raised/90 px-2 py-0.5 font-data text-[0.8125rem] font-semibold leading-5 tabular-nums text-copper-strong shadow-sm"
        role="img"
      >
        {rating ?? "—"}
      </span>
      <div className="flex min-w-0 items-start gap-1">
        <div className="min-w-0 flex-1">
          <h3
            className="m-0 line-clamp-2 font-ui text-sm font-semibold leading-snug text-ink sm:text-[0.9375rem]"
            id={titleId}
          >
            {game.name}
          </h3>
          <p
            className="m-0 mt-1 truncate font-data text-[0.6875rem] leading-4 text-ink-secondary sm:text-xs"
            title={meta}
          >
            {meta}
          </p>
        </div>
        <div className="-mr-2.5 -mt-2.5 shrink-0">
          {onDelete && (isFavorite || onSave === undefined) ? (
            <FavoriteDeleteAction
              game={game}
              messages={messages}
              onDelete={onDelete}
              placement="card"
            />
          ) : onSave ? (
            <FavoriteAction
              favoriteStatus={favoriteStatus}
              game={game}
              messages={messages}
              onSave={onSave}
              placement="card"
              status={authStatus}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
