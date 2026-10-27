"use client";

import { useEffect, useRef } from "react";

export function CollectionSentinel({
  enabled,
  onIntersect,
}: {
  enabled: boolean;
  onIntersect: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onIntersect();
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, onIntersect]);

  return (
    <div aria-hidden="true" className="pointer-events-none h-px" ref={ref} />
  );
}
