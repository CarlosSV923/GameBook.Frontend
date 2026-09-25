"use client";

import Link from "next/link";

import { usePreferences } from "@/features/preferences/preferences-provider";

type CatalogNavbarProps = {
  authState?: "authenticated" | "anonymous";
};

export function CatalogNavbar({ authState = "anonymous" }: CatalogNavbarProps) {
  const { copy } = usePreferences();

  return (
    <header className="catalog-navbar">
      <div className="catalog-navbar__inner">
        <Link className="catalog-brand" href="/">
          <span className="catalog-brand__mark" aria-hidden="true" />
          <span className="catalog-brand__name">GameBook</span>
          <span className="catalog-brand__tagline">
            {copy.navigation.tagline}
          </span>
        </Link>

        <nav
          aria-label={copy.navigation.primary}
          className="catalog-navbar__links"
        >
          <Link className="catalog-navbar__link" href="/#catalog">
            {copy.navigation.catalog}
          </Link>
          <Link className="catalog-navbar__link" href="/favorites">
            {copy.navigation.favorites}
          </Link>
        </nav>

        <nav aria-label={copy.navigation.account} className="account-links">
          {authState === "anonymous" ? (
            <>
              <Link className="account-links__secondary" href="/login">
                {copy.navigation.signIn}
              </Link>
              <Link className="account-links__primary" href="/register">
                {copy.navigation.createAccount}
              </Link>
            </>
          ) : (
            <>
              <Link className="account-links__secondary" href="/profile">
                {copy.navigation.profile}
              </Link>
              <Link className="account-links__primary" href="/favorites">
                {copy.navigation.favorites}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
