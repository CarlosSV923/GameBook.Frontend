export type IndexStripLabels = {
  platforms: string;
  rating: string;
  rank: string;
  unavailable: string;
  year: string;
};

export type IndexStripVariant = "card" | "card-compact" | "detail";

export type IndexStripProps = {
  labels: IndexStripLabels;
  platforms?: readonly string[];
  rank?: number | null;
  rating?: number | null;
  released?: string | null;
  score?: number | null;
  variant?: IndexStripVariant;
};

export function IndexStrip({
  labels,
  platforms = [],
  rank = null,
  rating,
  released = null,
  score = rating ?? null,
  variant = "card",
}: IndexStripProps) {
  const unavailable = labels.unavailable;
  const year = released?.slice(0, 4) || unavailable;
  const platformValue =
    platforms.length > 0 ? platforms.join(" · ") : unavailable;
  const rankValue = rank !== null ? `#${rank}` : unavailable;
  const visibleRank =
    rank !== null ? String(rank).padStart(2, "0") : unavailable;
  const scoreValue =
    typeof score === "number" &&
    Number.isFinite(score) &&
    score >= 0 &&
    score <= 100
      ? String(Math.round(score))
      : unavailable;

  const metrics = [
    { label: labels.rank, value: rankValue },
    { label: labels.rating, value: scoreValue },
    { label: labels.year, value: year },
    { label: labels.platforms, value: platformValue },
  ];

  return (
    <aside
      aria-label={`${labels.rank}: ${rankValue}; ${labels.rating}: ${scoreValue}; ${labels.year}: ${year}; ${labels.platforms}: ${platformValue}`}
      className={`grid min-w-0 bg-paper-inset text-ink ${variant === "detail" ? "grid-cols-2 gap-3 rounded-panel p-2 sm:grid-cols-4" : `${variant === "card-compact" ? "w-[52px] p-1.5" : "w-16 p-2 max-[767px]:w-[52px] max-[767px]:p-1.5"} content-start gap-3 max-[767px]:gap-2 border-r border-border-soft`}`}
      data-variant={variant}
    >
      <dl className={variant === "detail" ? "contents" : "grid gap-3"}>
        {metrics.map(({ label, value }, index) => (
          <div
            className={`grid min-w-0 gap-0.5 ${variant !== "detail" && index === 3 ? "max-[767px]:hidden" : ""}`}
            key={label}
          >
            {variant === "detail" ? (
              <dt className="font-ui text-[0.625rem] font-semibold uppercase leading-3 tracking-wide text-ink-muted">
                {label}
              </dt>
            ) : null}
            <dd
              className={`m-0 min-w-0 ${index === 3 && variant !== "detail" ? "font-data text-[9px] leading-3 [writing-mode:vertical-rl]" : index === 1 ? `whitespace-nowrap font-display tabular-nums ${variant === "card-compact" ? "text-[22px] leading-6" : "text-[28px] leading-8 max-[767px]:text-[22px] max-[767px]:leading-6"} ${variant === "detail" ? "text-ink" : ""}` : `font-data text-xs leading-4 tabular-nums ${variant === "detail" ? "text-ink" : "text-[0.625rem] leading-3"}`}`}
            >
              {variant === "detail" || index !== 0 ? value : visibleRank}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
