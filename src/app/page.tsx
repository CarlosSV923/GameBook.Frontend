"use client";

import { PreferenceControls } from "@/features/preferences/preference-controls";
import { usePreferences } from "@/features/preferences/preferences-provider";

export default function Home() {
  return (
    <main className="home-shell">
      <HomeIntro />
      <PreferenceControls />
    </main>
  );
}

function HomeIntro() {
  const { copy } = usePreferences();

  return (
    <header className="home-intro">
      <p className="eyebrow">{copy.home.eyebrow}</p>
      <h1>{copy.home.title}</h1>
      <p className="home-intro__description">{copy.home.description}</p>
    </header>
  );
}
