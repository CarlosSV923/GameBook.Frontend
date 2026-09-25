"use client";

import { AppShell } from "@/features/layout/app-shell";
import { CatalogList } from "@/features/catalog/catalog-list";
import { usePreferences } from "@/features/preferences/preferences-provider";

export default function Home() {
  return (
    <AppShell>
      <main className="home-shell">
        <HomeIntro />
        <CatalogPreview />
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
  return (
    <section className="catalog-preview" id="catalog">
      <CatalogList />
    </section>
  );
}
