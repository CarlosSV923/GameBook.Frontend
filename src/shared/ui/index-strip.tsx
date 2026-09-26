type IndexStripLabels = {
  platforms: string;
  rating: string;
  year: string;
};

type IndexStripProps = {
  labels: IndexStripLabels;
  platforms?: readonly string[];
  rating?: number | null;
  released?: string | null;
};

export function IndexStrip({
  labels,
  platforms = [],
  rating = null,
  released = null,
}: IndexStripProps) {
  const year = released?.slice(0, 4) ?? "—";
  const platformLabel = platforms.length > 0 ? platforms.join(" · ") : "—";

  return (
    <aside
      className="index-strip"
      aria-label={`${labels.rating}, ${labels.year}`}
    >
      <dl>
        <div className="index-strip__item">
          <dt>{labels.rating}</dt>
          <dd>{rating ?? "—"}</dd>
        </div>
        <div className="index-strip__item">
          <dt>{labels.year}</dt>
          <dd>{year}</dd>
        </div>
        <div className="index-strip__item index-strip__item--platforms">
          <dt>{labels.platforms}</dt>
          <dd>{platformLabel}</dd>
        </div>
      </dl>
    </aside>
  );
}
