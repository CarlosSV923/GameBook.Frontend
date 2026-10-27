"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/features/auth/ui/auth-provider";
import { PreferenceIconControls } from "@/features/preferences/ui/preference-controls";
import { usePreferences } from "@/features/preferences/ui/preferences-provider";
import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";

type CatalogNavbarProps = {
  authState?: "authenticated" | "anonymous";
};

export function CatalogNavbar({ authState = "anonymous" }: CatalogNavbarProps) {
  const { copy } = usePreferences();
  const router = useRouter();
  const { signOut, status } = useAuth();
  const resolvedAuthState =
    status === "authenticated" ? "authenticated" : authState;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const handleSignOut = () => {
    setMenuOpen(false);
    signOut();
    router.push("/");
  };
  const closeMenu = () => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  useEffect(() => {
    if (menuOpen) {
      menuPanelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    }
  }, [menuOpen]);

  const navigation = (
    <nav
      aria-label={copy.navigation.primary}
      className="flex flex-col gap-1 md:flex-row md:items-center"
    >
      <Link
        className="min-h-11 rounded-control px-3 py-3 text-sm font-medium text-ink-secondary hover:bg-paper-inset hover:text-ink"
        href="/#catalog"
        onClick={() => setMenuOpen(false)}
      >
        {copy.navigation.catalog}
      </Link>
    </nav>
  );
  const accountActions = (
    <nav
      aria-label={copy.navigation.account}
      className="flex flex-col gap-2 md:flex-row md:items-center"
    >
      {resolvedAuthState === "anonymous" ? (
        <>
          <Button
            className="w-full md:w-auto"
            href="/login"
            onClick={() => setMenuOpen(false)}
            variant="ghost"
          >
            {copy.navigation.signIn}
          </Button>
          <Button
            className="w-full md:w-auto"
            href="/register"
            onClick={() => setMenuOpen(false)}
            variant="primary"
          >
            {copy.navigation.createAccount}
          </Button>
        </>
      ) : (
        <>
          <Link
            className="min-h-11 rounded-control px-3 py-3 text-sm font-medium text-ink-secondary hover:bg-paper-inset hover:text-ink"
            href="/favorites"
            onClick={() => setMenuOpen(false)}
          >
            {copy.navigation.favorites}
          </Link>
          <Button
            className="w-full md:w-auto"
            href="/profile"
            onClick={() => setMenuOpen(false)}
            variant="ghost"
          >
            {copy.navigation.profile}
          </Button>
          <Button
            className="w-full md:w-auto"
            onClick={handleSignOut}
            variant="ghost"
          >
            {copy.navigation.signOut}
          </Button>
        </>
      )}
    </nav>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-paper-raised">
      <div className="mx-auto flex min-h-[70px] w-[calc(100%-32px)] max-w-[1120px] items-center justify-between gap-4 md:min-h-[74px] md:w-[calc(100%-48px)]">
        <Link className="flex shrink-0 items-center gap-3" href="/">
          <span aria-hidden="true" className="h-9 w-1 rounded-full bg-copper" />
          <span className="grid gap-1">
            <span className="font-display text-xl leading-none tracking-tight text-ink">
              GameBook
            </span>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.08em] text-ink-muted sm:block">
              {copy.navigation.tagline}
            </span>
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-between md:flex">
          {navigation}
          <div className="flex items-center gap-3">
            <PreferenceIconControls />
            {accountActions}
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <PreferenceIconControls showLanguage={false} />
          <IconButton
            aria-controls="mobile-navigation-panel"
            aria-expanded={menuOpen}
            aria-label={
              menuOpen ? copy.navigation.closeMenu : copy.navigation.openMenu
            }
            className="size-11"
            onClick={() => setMenuOpen((open) => !open)}
            ref={menuButtonRef}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </div>
      </div>

      {menuOpen ? (
        <div
          aria-label={copy.navigation.mobileMenu}
          className="absolute inset-x-0 top-full border-b border-border bg-paper-raised px-4 pb-5 pt-3 shadow-raised md:hidden"
          id="mobile-navigation-panel"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closeMenu();
            }
          }}
          ref={menuPanelRef}
          role="region"
        >
          {navigation}
          <div className="my-3 border-t border-border-soft" />
          <PreferenceIconControls showTheme={false} />
          <div className="my-3 border-t border-border-soft" />
          {accountActions}
        </div>
      ) : null}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
