"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/ui/auth-provider";
import { FavoritesList } from "@/features/favorites/ui/favorites-list";
import { AppShell } from "@/features/layout/ui/app-shell";
import { usePreferences } from "@/features/preferences/ui/preferences-provider";
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
        <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 sm:px-6 sm:py-12">
          <CatalogState context="favorites" kind="loading" messages={copy} />
        </main>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <section
            className="flex max-w-2xl gap-4 rounded-panel border border-border-soft bg-paper-raised p-6 shadow-raised sm:p-8"
            role="alert"
          >
            <span aria-hidden="true" className="w-1 shrink-0 bg-copper" />
            <div className="grid gap-4">
              <p className="m-0 font-ui text-xs font-bold uppercase tracking-[0.12em] text-copper-strong">
                {copy.favorites.eyebrow}
              </p>
              <p className="m-0 text-sm leading-6 text-ink-secondary">
                {copy.favorites.required}
              </p>
              <Link
                className="font-semibold text-copper-strong underline underline-offset-4"
                href="/login"
              >
                {copy.navigation.signIn}
              </Link>
            </div>
          </section>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell authState="authenticated">
      <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <header className="grid gap-3">
          <p className="m-0 font-ui text-xs font-bold uppercase tracking-[0.12em] text-copper-strong">
            {copy.favorites.eyebrow}
          </p>
          <h1 className="m-0 font-display text-4xl font-medium leading-tight tracking-tight text-ink">
            {copy.favorites.title}
          </h1>
          <p className="m-0 max-w-[56ch] text-sm leading-6 text-ink-secondary">
            {copy.favorites.description}
          </p>
        </header>
        <FavoritesList />
      </main>
    </AppShell>
  );
}
