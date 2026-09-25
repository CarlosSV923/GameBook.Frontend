import Image from "next/image";

import type { Messages } from "@/shared/i18n/messages";
import { IndexStrip } from "@/shared/ui/index-strip";
import type { IgdbGameCard as IgdbGameCardData } from "@/shared/api/igdb";

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
            sizes="(max-width: 720px) 40vw, 180px"
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
        <div>
          <p className="game-card__kicker">{messages.catalog.cardKicker}</p>
          <h3 id={titleId}>{game.name}</h3>
        </div>
        <IndexStrip
          labels={messages.indexStrip}
          platforms={game.platforms.map((platform) => platform.name)}
          rating={game.rating}
          released={game.released}
        />
      </div>
    </article>
  );
}
