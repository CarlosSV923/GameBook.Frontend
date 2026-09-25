"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/auth-provider";
import { FavoritesList } from "@/features/favorites/favorites-list";
import { AppShell } from "@/features/layout/app-shell";
import { usePreferences } from "@/features/preferences/preferences-provider";
import { CatalogState } from "@/shared/ui/catalog-state";

export function FavoritesPage() {
  const { copy } = usePreferences();
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "loading") {
    return (
      <AppShell authState="authenticated">
        <main className="favorites-page">
          <CatalogState context="favorites" kind="loading" messages={copy} />
        </main>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <main className="favorites-page">
          <section className="favorites-required" role="alert">
            <p className="eyebrow">{copy.favorites.eyebrow}</p>
            <p>{copy.favorites.required}</p>
            <Link href="/login">{copy.navigation.signIn}</Link>
          </section>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell authState="authenticated">
      <main className="favorites-page">
        <header className="favorites-page__header">
          <p className="eyebrow">{copy.favorites.eyebrow}</p>
          <h1>{copy.favorites.title}</h1>
          <p>{copy.favorites.description}</p>
        </header>
        <FavoritesList />
      </main>
    </AppShell>
  );
}
