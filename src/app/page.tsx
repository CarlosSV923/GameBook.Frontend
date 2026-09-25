"use client";

import { AppShell } from "@/features/layout/app-shell";
import { CatalogList } from "@/features/catalog/catalog-list";
import { PreferenceControls } from "@/features/preferences/preference-controls";
import { usePreferences } from "@/features/preferences/preferences-provider";

export default function Home() {
  return (
    <AppShell>
      <main className="home-shell">
        <HomeIntro />
        <CatalogPreview />
        <PreferenceControls />
      </main>
    </AppShell>
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

function CatalogPreview() {
  const { copy } = usePreferences();

  return (
    <section
      aria-labelledby="catalog-title"
      className="catalog-preview"
      id="catalog"
    >
      <div className="catalog-preview__heading">
        <p className="eyebrow">{copy.catalog.eyebrow}</p>
        <h2 id="catalog-title">{copy.catalog.title}</h2>
        <p>{copy.catalog.description}</p>
      </div>
      <CatalogList />
    </section>
  );
}
