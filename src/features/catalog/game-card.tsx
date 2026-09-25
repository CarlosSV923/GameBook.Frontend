import Image from "next/image";

import {
  formatGamePlatforms,
  formatGameRating,
  formatGameYear,
} from "@/features/catalog/game-card-formatting";
import type { IgdbGameCard as IgdbGameCardData } from "@/shared/api/igdb";
import type { Messages } from "@/shared/i18n/messages";

type GameCardProps = {
  game: IgdbGameCardData;
  messages: Messages;
};

export function GameCard({ game, messages }: GameCardProps) {
  const titleId = `game-card-${game.igdbId}`;
  const coverAlt = messages.catalog.coverAlt.replace("{name}", game.name);

  return (
    <article aria-labelledby={titleId} className="game-card">
      <div className="game-card__media">
        {game.imageUrl ? (
          <Image
            alt={coverAlt}
            className="game-card__image"
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 720px) 40vw, (max-width: 980px) 30vw, 20vw"
            src={game.imageUrl}
          />
        ) : (
          <div
            aria-hidden="true"
            className="game-card__fallback"
            title={messages.catalog.missingImage}
          >
            <span>{game.name.slice(0, 1).toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="game-card__content">
        <h3 id={titleId}>{game.name}</h3>
        <div className="game-card__details">
          <div
            aria-label={`${messages.indexStrip.rating}: ${formatGameRating(game.rating)}`}
            className={`game-card__rating${game.rating === null ? " game-card__rating--missing" : ""}`}
          >
            <StarIcon />
            <span>{formatGameRating(game.rating)}</span>
          </div>
          <p
            aria-label={`${messages.indexStrip.year}: ${formatGameYear(game.released)}; ${messages.indexStrip.platforms}: ${formatGamePlatforms(game.platforms)}`}
            className="game-card__subline"
            title={formatGamePlatforms(game.platforms)}
          >
            <span>{formatGameYear(game.released)}</span>
            <span aria-hidden="true">•</span>
            <span className="game-card__platforms">
              {formatGamePlatforms(game.platforms)}
            </span>
          </p>
        </div>
      </div>
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
