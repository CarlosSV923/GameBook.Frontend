"use client";

import { usePreferences } from "@/features/preferences/preferences-provider";

export function PreferenceIconControls() {
  const { copy, language, setLanguage, setTheme, theme } = usePreferences();
  const nextTheme = theme === "light" ? "dark" : "light";
  const nextLanguage = language === "en" ? "es" : "en";
  const themeLabel =
    nextTheme === "dark"
      ? copy.preferences.switchToDark
      : copy.preferences.switchToLight;
  const languageLabel =
    nextLanguage === "es"
      ? copy.preferences.switchToSpanish
      : copy.preferences.switchToEnglish;

  return (
    <div
      aria-label={copy.preferences.title}
      className="preference-icon-controls"
      role="group"
    >
      <button
        aria-label={themeLabel}
        className="preference-icon-button"
        data-preference="theme"
        onClick={() => setTheme(nextTheme)}
        title={themeLabel}
        type="button"
      >
        <ThemeIcon theme={theme} />
      </button>
      <button
        aria-label={languageLabel}
        className="preference-icon-button"
        data-preference="language"
        onClick={() => setLanguage(nextLanguage)}
        title={languageLabel}
        type="button"
      >
        <GlobeIcon />
      </button>
    </div>
  );
}

function ThemeIcon({ theme }: { theme: "light" | "dark" }) {
  return theme === "light" ? (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20.8 15.1A8.7 8.7 0 0 1 8.9 3.2 8.8 8.8 0 1 0 20.8 15.1Z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.4 2.4 3.6 5.4 3.6 9S14.4 18.6 12 21M12 3C9.6 5.4 8.4 8.4 8.4 12s1.2 6.6 3.6 9" />
    </svg>
  );
}
