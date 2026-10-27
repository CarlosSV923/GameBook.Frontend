"use client";

import { usePreferences } from "@/features/preferences/ui/preferences-provider";

export function HomeIntro() {
  const { copy } = usePreferences();

  return (
    <header className="grid content-center gap-3 py-3 md:min-h-[210px] md:py-5">
      <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-copper-strong">
        {copy.home.eyebrow}
      </p>
      <h1 className="m-0 max-w-[22ch] font-display text-4xl font-medium leading-[1.04] tracking-[-0.045em] text-ink md:text-[clamp(2.5rem,4vw,3.75rem)]">
        {copy.home.title}
      </h1>
      <p className="m-0 max-w-[68ch] text-sm leading-relaxed text-ink-secondary md:text-base">
        {copy.home.description}
      </p>
    </header>
  );
}
