"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { createIgdbCatalogClient } from "@/features/catalog/api/igdb-catalog-client";
import type { AuthStatus } from "@/features/auth/ui/auth-provider";
import { GameDetailContent } from "@/features/catalog/ui/game-detail-content";
import {
  FavoriteAction,
  FavoriteDeleteAction,
} from "@/features/catalog/ui/favorite-action";
import type { FavoriteCreateInput } from "@/features/favorites/model/game";
import type {
  IgdbGameCard,
  IgdbGameDetail,
} from "@/features/catalog/model/igdb";
import type { Messages } from "@/shared/i18n/messages";
import { gameDetailKey } from "@/shared/query/query-keys";
import { IconButton } from "@/shared/ui/icon-button";
import { IndexStrip } from "@/shared/ui/index-strip";
import { IgdbAttribution } from "@/shared/ui/igdb-attribution";

type GameDetailModalProps = {
  game: IgdbGameCard;
  favoriteStatus?: "loading" | "ready";
  isFavorite?: boolean;
  position?: number;
  messages: Messages;
  onDelete?: (igdbId: number) => Promise<void>;
  onDetailLoaded?: (detail: IgdbGameDetail) => Promise<void>;
  onSave?: (game: FavoriteCreateInput) => Promise<void>;
  onClose: () => void;
  authStatus: AuthStatus;
};

type DetailStatus = "error" | "loading" | "ready" | "unavailable";
type SnapshotStatus = "error" | "idle" | "syncing" | "updated";

export function GameDetailModal({
  favoriteStatus = "ready",
  game,
  isFavorite = false,
  position,
  messages,
  onDelete,
  onDetailLoaded,
  onSave,
  onClose,
  authStatus,
}: GameDetailModalProps) {
  const [snapshotStatus, setSnapshotStatus] = useState<SnapshotStatus>("idle");
  const [coverUrl, setCoverUrl] = useState(game.imageUrl);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const snapshotSyncStarted = useRef(false);
  const detailQuery = useQuery({
    queryKey: gameDetailKey(game.igdbId),
    queryFn: ({ signal }) =>
      createIgdbCatalogClient().getGameDetail(game.igdbId, signal),
  });
  const detail = detailQuery.data ?? null;
  const status: DetailStatus = detailQuery.isPending
    ? "loading"
    : detailQuery.isError
      ? "error"
      : detail === null
        ? "unavailable"
        : "ready";

  useEffect(() => {
    if (!detail || !onDetailLoaded || snapshotSyncStarted.current) return;
    snapshotSyncStarted.current = true;
    setSnapshotStatus("syncing");
    void onDetailLoaded(detail)
      .then(() => setSnapshotStatus("updated"))
      .catch(() => setSnapshotStatus("error"));
  }, [detail, onDetailLoaded]);

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
      if (
        event.target instanceof Element &&
        event.target.closest("[data-favorite-popover]")
      ) {
        if (event.key === "Escape") return;
        const favoritePopover = document.querySelector<HTMLElement>(
          "[data-favorite-popover]",
        );
        const favoriteFocusables = favoritePopover
          ? Array.from(
              favoritePopover.querySelectorAll<HTMLElement>(
                "button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
              ),
            ).filter((element) => !element.hasAttribute("disabled"))
          : [];
        const firstFavorite = favoriteFocusables[0];
        const lastFavorite = favoriteFocusables.at(-1);
        const modalFocusables = modal
          ? Array.from(
              modal.querySelectorAll<HTMLElement>(
                "button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
              ),
            ).filter(
              (element) =>
                !element.hasAttribute("disabled") &&
                !element.closest("[data-favorite-popover]"),
            )
          : [];
        if (
          event.key === "Tab" &&
          event.shiftKey &&
          document.activeElement === firstFavorite
        ) {
          event.preventDefault();
          modalFocusables.at(-1)?.focus();
        } else if (
          event.key === "Tab" &&
          !event.shiftKey &&
          document.activeElement === lastFavorite
        ) {
          event.preventDefault();
          modalFocusables[0]?.focus();
        }
        return;
      }

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

      if (!modal.contains(document.activeElement)) {
        event.preventDefault();
        firstElement.focus();
      } else if (event.shiftKey && document.activeElement === firstElement) {
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
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-scrim p-6 motion-safe:animate-[detail-scrim-in_220ms_ease-out_both] max-[639px]:p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      ref={modalRef}
      role="dialog"
    >
      <div className="flex max-h-[calc(100svh-48px)] w-full max-w-[820px] flex-col overflow-y-auto rounded-modal border border-border bg-paper-raised shadow-raised motion-safe:animate-[detail-panel-in_220ms_cubic-bezier(0.2,0.7,0.2,1)_both]">
        <header className="relative grid shrink-0 grid-cols-[152px_minmax(0,1fr)_44px] items-start gap-6 border-b border-border-soft p-6 max-[639px]:gap-4 max-[639px]:p-4 max-[479px]:flex max-[479px]:flex-col max-[479px]:gap-4 max-[479px]:p-3">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-control border border-border-soft bg-paper-inset max-[479px]:w-[92px]">
            {coverUrl ? (
              <Image
                alt={coverAlt}
                className="object-cover"
                fill
                onError={() => setCoverUrl(null)}
                sizes="(max-width: 720px) 40vw, 180px"
                src={coverUrl}
              />
            ) : (
              <span
                aria-label={messages.catalog.missingImage}
                className="grid size-full place-items-center content-center gap-2 border-l-[3px] border-copper bg-paper-inset font-display text-5xl text-copper-strong"
                role="img"
              >
                <span aria-hidden="true" className="text-6xl">
                  {game.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-[14ch] text-center font-ui text-xs text-ink-muted">
                  {messages.catalog.missingImage}
                </span>
              </span>
            )}
          </div>
          <div className="min-w-0 self-center max-[479px]:w-full">
            <p className="mb-3 font-ui text-[0.6875rem] font-bold uppercase leading-snug tracking-[0.1em] text-copper-strong">
              {messages.catalog.detail.eyebrow}
            </p>
            <h2
              className="mb-5 text-balance font-display text-[clamp(1.8rem,4vw,2.8rem)] font-medium leading-none tracking-[-0.04em] text-ink"
              id="game-detail-title"
            >
              {game.name}
            </h2>
          </div>
          <IconButton
            aria-label={messages.catalog.detail.close}
            className="border border-border-soft max-[479px]:absolute max-[479px]:right-3 max-[479px]:top-3"
            onClick={onClose}
            ref={closeButtonRef}
          >
            <svg
              aria-hidden="true"
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
          </IconButton>
          <div className="col-span-full max-[479px]:w-full">
            <IndexStrip
              labels={messages.indexStrip}
              platforms={game.platforms.map(({ name }) => name)}
              rank={position ?? null}
              released={game.released}
              rating={game.rating}
              variant="detail"
            />
          </div>
          <div className="col-span-full max-[479px]:w-full">
            {onDelete && (isFavorite || onSave === undefined) ? (
              <FavoriteDeleteAction
                game={game}
                messages={messages}
                onDelete={onDelete}
                placement="modal"
              />
            ) : onSave ? (
              <FavoriteAction
                favoriteStatus={favoriteStatus}
                game={game}
                messages={messages}
                onSave={onSave}
                placement="modal"
                status={authStatus}
              />
            ) : null}
          </div>
        </header>

        <div
          aria-live="polite"
          className="grid gap-6 p-6 max-[639px]:p-4 max-[479px]:p-3"
        >
          {status === "loading" ? (
            <p
              className="flex items-center gap-3 rounded-panel border-l-4 border-copper bg-paper-inset p-4 text-sm leading-relaxed text-ink-secondary"
              role="status"
            >
              <span
                aria-hidden="true"
                className="loading-spinner loading-spinner--small"
              />
              {messages.catalog.detail.loading}
            </p>
          ) : null}
          {status === "unavailable" ? (
            <div
              className="rounded-panel border-l-4 border-copper bg-paper-inset p-4"
              role="status"
            >
              <h3 className="mb-2 font-ui text-base font-semibold text-ink">
                {messages.catalog.detail.unavailableTitle}
              </h3>
              <p className="m-0 text-sm leading-relaxed text-ink-secondary">
                {messages.catalog.detail.unavailableDescription}
              </p>
            </div>
          ) : null}
          {status === "error" ? (
            <div
              className="rounded-panel border-l-4 border-danger bg-paper-inset p-4"
              role="alert"
            >
              <h3 className="mb-2 font-ui text-base font-semibold text-ink">
                {messages.catalog.detail.errorTitle}
              </h3>
              <p className="m-0 text-sm leading-relaxed text-ink-secondary">
                {messages.catalog.detail.errorDescription}
              </p>
            </div>
          ) : null}
          {snapshotStatus === "syncing" ? (
            <p
              className="flex items-center gap-2 rounded-control border-l-[3px] border-copper bg-paper-inset px-3 py-2.5 font-ui text-xs leading-relaxed text-ink-secondary"
              role="status"
            >
              <span
                aria-hidden="true"
                className="loading-spinner loading-spinner--small"
              />
              {messages.catalog.detail.syncing}
            </p>
          ) : null}
          {snapshotStatus === "updated" ? (
            <p
              className="rounded-control border-l-[3px] border-moss bg-paper-inset px-3 py-2.5 font-ui text-xs leading-relaxed text-ink-secondary"
              role="status"
            >
              {messages.catalog.detail.updated}
            </p>
          ) : null}
          {snapshotStatus === "error" ? (
            <p
              className="rounded-control border-l-[3px] border-danger bg-paper-inset px-3 py-2.5 font-ui text-xs leading-relaxed text-ink"
              role="alert"
            >
              {messages.catalog.detail.syncError}
            </p>
          ) : null}
          {status === "ready" && detail ? (
            <GameDetailContent detail={detail} messages={messages} />
          ) : null}
        </div>
        <IgdbAttribution messages={messages} />
      </div>
    </div>
  );
}
