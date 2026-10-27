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
import { IndexStrip } from "@/shared/ui/index-strip";

type GameCardProps = {
  game: IgdbGameCardData;
  messages: Messages;
  position?: number;
  favoriteStatus?: "loading" | "ready";
  isFavorite?: boolean;
  onDelete?: (igdbId: number) => Promise<void>;
  onSave?: (game: FavoriteCreateInput) => Promise<void>;
  onSelect: () => void;
  authStatus: AuthStatus;
};

export function GameCard({
  authStatus,
  favoriteStatus = "ready",
  game,
  isFavorite = false,
  messages,
  onDelete,
  onSave,
  onSelect,
  position,
}: GameCardProps) {
  const [imageUrl, setImageUrl] = useState(game.imageUrl);
  const titleId = `game-card-${game.igdbId}`;
  const coverAlt = messages.catalog.coverAlt.replace("{name}", game.name);
  const platformNames = game.platforms.map(({ name }) => name);
  const metaUnavailable = messages.indexStrip.unavailable;
  const year = game.released?.slice(0, 4) || metaUnavailable;
  const platforms = platformNames.length
    ? platformNames.join(" · ")
    : metaUnavailable;

  return (
    <article
      aria-labelledby={titleId}
      className="group relative flex min-h-[148px] min-w-0 overflow-visible rounded-panel border border-border bg-paper-raised shadow-sm transition-shadow hover:shadow-md min-[768px]:grid min-[768px]:min-h-0 min-[768px]:grid-cols-[64px_minmax(0,1fr)]"
    >
      <IndexStrip
        labels={messages.indexStrip}
        platforms={platformNames}
        rank={position ?? null}
        released={game.released}
        rating={game.rating}
        variant="card"
      />
      <button
        aria-label={messages.catalog.detail.open.replace("{name}", game.name)}
        className="flex min-w-0 flex-1 items-stretch gap-3 rounded-r-panel p-3 text-left text-ink outline-none focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-focus focus-visible:outline-offset-2 min-[768px]:flex-col min-[768px]:gap-0 min-[768px]:p-0"
        onClick={onSelect}
        type="button"
      >
        <span className="relative hidden aspect-[4/3] w-full shrink-0 self-center overflow-hidden rounded-tr-panel bg-paper-inset min-[768px]:block">
          {imageUrl ? (
            <Image
              alt={coverAlt}
              className="object-cover"
              fill
              onError={() => setImageUrl(null)}
              sizes="(min-width: 768px) 320px, 112px"
              src={imageUrl}
            />
          ) : (
            <span
              aria-label={messages.catalog.missingImage}
              className="grid size-full place-items-center border-l-[3px] border-copper bg-paper-inset font-display text-3xl text-copper-strong"
              role="img"
            >
              <span>{game.name.slice(0, 1).toUpperCase()}</span>
            </span>
          )}
        </span>
        <span className="relative -ml-3 -my-3 grid w-[72px] shrink-0 place-items-center overflow-hidden rounded-none bg-paper-inset min-[768px]:hidden">
          {imageUrl ? (
            <Image
              alt={coverAlt}
              className="object-cover"
              fill
              onError={() => setImageUrl(null)}
              sizes="72px"
              src={imageUrl}
            />
          ) : (
            <span
              aria-label={messages.catalog.missingImage}
              className="grid size-full place-items-center border-l-[3px] border-copper bg-paper-inset font-display text-2xl text-copper-strong"
              role="img"
            >
              <span>{game.name.slice(0, 1).toUpperCase()}</span>
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-1 sm:py-0 min-[768px]:flex-row min-[768px]:items-center min-[768px]:min-h-14 min-[768px]:px-3 min-[768px]:py-3 min-[768px]:pr-14">
          <span
            aria-level={3}
            className="line-clamp-2 min-w-0 flex-1 font-ui text-sm font-semibold leading-snug text-ink sm:text-base"
            id={titleId}
            role="heading"
          >
            {game.name}
          </span>
          <span
            aria-label={`${messages.indexStrip.year}: ${year}; ${messages.indexStrip.platforms}: ${platforms}`}
            className="line-clamp-2 font-data text-[0.6875rem] leading-4 text-ink-secondary min-[768px]:hidden"
          >
            {year} · {platforms}
          </span>
        </span>
      </button>
      <div className="flex shrink-0 items-center px-1 sm:pr-2 min-[768px]:absolute min-[768px]:bottom-1.5 min-[768px]:right-1.5">
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
    </article>
  );
}
