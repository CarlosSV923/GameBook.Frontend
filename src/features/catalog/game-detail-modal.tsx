"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { createIgdbCatalogClient } from "@/features/api/igdb-catalog-client";
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
import { formatGameReleaseDate } from "@/features/catalog/game-detail-formatting";
import type { FavoriteCreateInput } from "@/shared/api/game";
import type { IgdbGameCard, IgdbGameDetail } from "@/shared/api/igdb";
import type { Messages } from "@/shared/i18n/messages";
import { IgdbAttribution } from "@/shared/ui/igdb-attribution";

type GameDetailModalProps = {
  game: IgdbGameCard;
  messages: Messages;
  onDelete?: (igdbId: number) => Promise<void>;
  onDetailLoaded?: (detail: IgdbGameDetail) => Promise<void>;
  onSave?: (game: FavoriteCreateInput) => Promise<void>;
  onClose: () => void;
  authStatus: AuthStatus;
};

type DetailStatus = "error" | "loading" | "ready";
type SnapshotStatus = "error" | "idle" | "syncing" | "updated";

export function GameDetailModal({
  game,
  messages,
  onDelete,
  onDetailLoaded,
  onSave,
  onClose,
  authStatus,
}: GameDetailModalProps) {
  const [detail, setDetail] = useState<IgdbGameDetail | null>(null);
  const [status, setStatus] = useState<DetailStatus>("loading");
  const [snapshotStatus, setSnapshotStatus] = useState<SnapshotStatus>("idle");
  const [coverUrl, setCoverUrl] = useState(game.imageUrl);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    void createIgdbCatalogClient()
      .getGameDetail(game.igdbId, controller.signal)
      .then((nextDetail) => {
        if (!isActive) {
          return;
        }

        setDetail(nextDetail);
        setStatus(nextDetail ? "ready" : "error");

        if (nextDetail && onDetailLoaded) {
          setSnapshotStatus("syncing");
          void onDetailLoaded(nextDetail)
            .then(() => {
              if (isActive) {
                setSnapshotStatus("updated");
              }
            })
            .catch(() => {
              if (isActive) {
                setSnapshotStatus("error");
              }
            });
        }
      })
      .catch(() => {
        if (isActive && !controller.signal.aborted) {
          setStatus("error");
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [game.igdbId, onDetailLoaded]);

  useEffect(() => {
    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const modal = modalRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modal) {
        return;
      }

      const focusableElements = Array.from(
        modal.querySelectorAll<HTMLElement>(
          "button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
        ),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [onClose]);

  const coverAlt = messages.catalog.coverAlt.replace("{name}", game.name);

  return (
    <div
      aria-labelledby="game-detail-title"
      aria-modal="true"
      className="game-detail-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      ref={modalRef}
      role="dialog"
    >
      <div className="game-detail-modal__panel">
        <header className="game-detail-modal__header">
          <div className="game-detail-modal__media">
            {coverUrl ? (
              <Image
                alt={coverAlt}
                className="game-detail-modal__image"
                fill
                onError={() => setCoverUrl(null)}
                sizes="(max-width: 720px) 40vw, 180px"
                src={coverUrl}
              />
            ) : (
              <span
                aria-label={messages.catalog.missingImage}
                className="game-detail-modal__fallback"
                role="img"
              >
                <span aria-hidden="true">
                  {game.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="game-detail-modal__fallback-label">
                  {messages.catalog.missingImage}
                </span>
              </span>
            )}
          </div>
          <div className="game-detail-modal__heading">
            <p className="game-detail-modal__eyebrow">
              {messages.catalog.detail.eyebrow}
            </p>
            <h2 id="game-detail-title">{game.name}</h2>
            <p className="game-detail-modal__meta">
              <span>{formatGameRating(game.rating)}</span>
              <span aria-hidden="true">•</span>
              <span>{formatGameYear(game.released)}</span>
              <span aria-hidden="true">•</span>
              <span>{formatGamePlatforms(game.platforms)}</span>
            </p>
            {onDelete ? (
              <FavoriteDeleteAction
                game={game}
                messages={messages}
                onDelete={onDelete}
                placement="modal"
              />
            ) : onSave ? (
              <FavoriteAction
                game={game}
                messages={messages}
                onSave={onSave}
                placement="modal"
                status={authStatus}
              />
            ) : null}
          </div>
          <button
            aria-label={messages.catalog.detail.close}
            className="game-detail-modal__close"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div aria-live="polite" className="game-detail-modal__body">
          {status === "loading" ? (
            <p className="game-detail-modal__status" role="status">
              <span aria-hidden="true" className="loading-spinner" />
              {messages.catalog.detail.loading}
            </p>
          ) : null}
          {status === "error" ? (
            <div className="game-detail-modal__error" role="alert">
              <h3>{messages.catalog.detail.errorTitle}</h3>
              <p>{messages.catalog.detail.errorDescription}</p>
            </div>
          ) : null}
          {snapshotStatus === "syncing" ? (
            <p className="game-detail-modal__sync" role="status">
              <span aria-hidden="true" className="loading-spinner" />
              {messages.catalog.detail.syncing}
            </p>
          ) : null}
          {snapshotStatus === "updated" ? (
            <p className="game-detail-modal__sync" role="status">
              {messages.catalog.detail.updated}
            </p>
          ) : null}
          {snapshotStatus === "error" ? (
            <p
              className="game-detail-modal__sync game-detail-modal__sync--error"
              role="alert"
            >
              {messages.catalog.detail.syncError}
            </p>
          ) : null}
          {status === "ready" && detail ? (
            <DetailContent detail={detail} messages={messages} />
          ) : null}
        </div>
        <IgdbAttribution messages={messages} />
      </div>
    </div>
  );
}

type DetailContentProps = {
  detail: IgdbGameDetail;
  messages: Messages;
};

function DetailContent({ detail, messages }: DetailContentProps) {
  const detailCopy = messages.catalog.detail;
  const formattedDate = formatGameReleaseDate(
    detail.released,
    detail.releaseDatePrecision,
  );

  return (
    <>
      <section className="game-detail-modal__section">
        <h3>{detailCopy.summary}</h3>
        <p>{detail.summary === null ? detailCopy.noSummary : detail.summary}</p>
      </section>
      <dl className="game-detail-modal__facts">
        <div>
          <dt>{detailCopy.releaseDate}</dt>
          <dd>{formattedDate}</dd>
        </div>
        <div>
          <dt>{detailCopy.genres}</dt>
          <dd>
            {detail.genres.length > 0
              ? detail.genres.join(" · ")
              : detailCopy.noGenres}
          </dd>
        </div>
        <div>
          <dt>{detailCopy.developers}</dt>
          <dd>
            {detail.developers.length > 0
              ? detail.developers.join(" · ")
              : detailCopy.noDevelopers}
          </dd>
        </div>
      </dl>
      {detail.screenshots.length > 0 ? (
        <section className="game-detail-modal__section">
          <h3>{detailCopy.screenshots}</h3>
          <div className="game-detail-modal__screenshots">
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
    <div className="game-detail-modal__screenshot">
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
          className="game-detail-modal__screenshot-fallback"
          role="img"
        >
          {missingImage}
        </span>
      )}
    </div>
  );
}
