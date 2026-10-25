"use client";

import { usePreferences } from "@/features/preferences/ui/preferences-provider";

export function HomeIntro() {
  const { copy } = usePreferences();

  return (
    <header className="home-intro">
      <p className="eyebrow">{copy.home.eyebrow}</p>
      <h1>{copy.home.title}</h1>
      <p className="home-intro__description">{copy.home.description}</p>
    </header>
  );
}
