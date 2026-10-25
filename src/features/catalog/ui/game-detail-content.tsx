import Image from "next/image";
import { useState } from "react";

import { formatGameReleaseDate } from "@/features/catalog/model/game-detail-formatting";
import type { IgdbGameDetail } from "@/features/catalog/model/igdb";
import type { Messages } from "@/shared/i18n/messages";

type GameDetailContentProps = {
  detail: IgdbGameDetail;
  messages: Messages;
};

export function GameDetailContent({
  detail,
  messages,
}: GameDetailContentProps) {
  const detailCopy = messages.catalog.detail;
  const formattedDate = formatGameReleaseDate(
    detail.released,
    detail.releaseDatePrecision,
  );

  return (
    <>
      <section>
        <h3 className="mb-2.5 font-ui text-xs font-bold uppercase leading-snug tracking-[0.1em] text-ink">
          {detailCopy.summary}
        </h3>
        <p className="m-0 text-sm leading-relaxed text-ink-secondary [text-wrap:pretty]">
          {detail.summary === null ? detailCopy.noSummary : detail.summary}
        </p>
      </section>
      <dl className="m-0 grid grid-cols-3 gap-4 border-y border-border-soft py-4 max-[479px]:grid-cols-1">
        <div>
          <dt className="mb-1.5 font-ui text-[0.625rem] font-bold uppercase leading-snug tracking-[0.08em] text-ink-muted">
            {detailCopy.releaseDate}
          </dt>
          <dd className="m-0 break-words text-[0.8125rem] leading-relaxed text-ink-secondary">
            {formattedDate}
          </dd>
        </div>
        <div>
          <dt className="mb-1.5 font-ui text-[0.625rem] font-bold uppercase leading-snug tracking-[0.08em] text-ink-muted">
            {detailCopy.genres}
          </dt>
          <dd className="m-0 break-words text-[0.8125rem] leading-relaxed text-ink-secondary">
            {detail.genres.length > 0
              ? detail.genres.join(" · ")
              : detailCopy.noGenres}
          </dd>
        </div>
        <div>
          <dt className="mb-1.5 font-ui text-[0.625rem] font-bold uppercase leading-snug tracking-[0.08em] text-ink-muted">
            {detailCopy.developers}
          </dt>
          <dd className="m-0 break-words text-[0.8125rem] leading-relaxed text-ink-secondary">
            {detail.developers.length > 0
              ? detail.developers.join(" · ")
              : detailCopy.noDevelopers}
          </dd>
        </div>
      </dl>
      {detail.screenshots.length > 0 ? (
        <section>
          <h3 className="mb-2.5 font-ui text-xs font-bold uppercase leading-snug tracking-[0.1em] text-ink">
            {detailCopy.screenshots}
          </h3>
          <div className="grid grid-cols-2 gap-3 max-[479px]:grid-cols-1">
            {detail.screenshots.map((screenshot, index) => (
              <DetailScreenshot
                alt={detailCopy.screenshotAlt
                  .replace("{number}", String(index + 1))
                  .replace("{name}", detail.name)}
                key={`${screenshot}-${index}`}
                missingImage={messages.catalog.missingImage}
                src={screenshot}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

type DetailScreenshotProps = {
  alt: string;
  missingImage: string;
  src: string;
};

function DetailScreenshot({ alt, missingImage, src }: DetailScreenshotProps) {
  const [imageUrl, setImageUrl] = useState(src);

  return (
    <div className="relative aspect-video overflow-hidden rounded-control border border-border-soft bg-paper-inset">
      {imageUrl ? (
        <Image
          alt={alt}
          fill
          onError={() => setImageUrl("")}
          sizes="(max-width: 720px) 100vw, 50vw"
          src={imageUrl}
        />
      ) : (
        <span
          aria-label={missingImage}
          className="grid size-full place-items-center p-4 text-center text-[0.6875rem] text-ink-muted"
          role="img"
        >
          {missingImage}
        </span>
      )}
    </div>
  );
}
