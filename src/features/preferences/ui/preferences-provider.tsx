"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { messages, type Messages } from "@/shared/i18n/messages";
import {
  isLanguage,
  isTheme,
  preferenceStorageKeys,
  type Language,
  type Theme,
} from "@/shared/preferences/storage";

type PreferencesContextValue = {
  copy: Messages;
  language: Language;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  theme: Theme;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);
const themeSubscribers = new Set<() => void>();
const languageSubscribers = new Set<() => void>();

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function applyLanguage(language: Language) {
  document.documentElement.lang = language;
}

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedTheme = window.localStorage.getItem(
      preferenceStorageKeys.theme,
    );
    return isTheme(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
}

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return getStoredTheme() ?? getSystemTheme();
}

function subscribeToTheme(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = () => {
    if (getStoredTheme()) {
      return;
    }

    applyTheme(getThemeSnapshot());
    listener();
  };

  themeSubscribers.add(listener);
  mediaQuery.addEventListener("change", handleSystemThemeChange);

  return () => {
    themeSubscribers.delete(listener);
    mediaQuery.removeEventListener("change", handleSystemThemeChange);
  };
}

function subscribeToLanguage(listener: () => void) {
  languageSubscribers.add(listener);

  return () => languageSubscribers.delete(listener);
}

function getLanguageSnapshot(): Language {
  if (typeof window === "undefined") {
    return "en";
  }

  try {
    const storedLanguage = window.localStorage.getItem(
      preferenceStorageKeys.language,
    );
    return isLanguage(storedLanguage) ? storedLanguage : "en";
  } catch {
    return "en";
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    (): Theme => "light",
  );
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    (): Language => "en",
  );

  useEffect(() => applyTheme(theme), [theme]);
  useEffect(() => applyLanguage(language), [language]);

  const setTheme = useCallback((nextTheme: Theme) => {
    try {
      window.localStorage.setItem(preferenceStorageKeys.theme, nextTheme);
    } catch {
      // Theme still applies for this session if storage is unavailable.
    }

    applyTheme(nextTheme);
    themeSubscribers.forEach((listener) => listener());
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    try {
      window.localStorage.setItem(preferenceStorageKeys.language, nextLanguage);
    } catch {
      // Language still applies for this session if storage is unavailable.
    }

    applyLanguage(nextLanguage);
    languageSubscribers.forEach((listener) => listener());
  }, []);

  const value = useMemo(
    () => ({
      copy: messages[language],
      language,
      setLanguage,
      setTheme,
      theme,
    }),
    [language, setLanguage, setTheme, theme],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }

  return context;
}
