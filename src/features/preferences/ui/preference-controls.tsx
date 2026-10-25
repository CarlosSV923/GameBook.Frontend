"use client";

import { usePreferences } from "@/features/preferences/ui/preferences-provider";
import { IconButton } from "@/shared/ui/icon-button";
import { SegmentedControl } from "@/shared/ui/segmented-control";

export function PreferenceIconControls({
  showLanguage = true,
  showTheme = true,
}: {
  showLanguage?: boolean;
  showTheme?: boolean;
}) {
  const { copy, language, setLanguage, setTheme, theme } = usePreferences();
  const nextTheme = theme === "light" ? "dark" : "light";
  const themeLabel =
    nextTheme === "dark"
      ? copy.preferences.switchToDark
      : copy.preferences.switchToLight;

  return (
    <div
      aria-label={copy.preferences.title}
      className="flex items-center gap-2"
      role="group"
    >
      {showTheme ? (
        <IconButton
          aria-label={themeLabel}
          className="preference-theme-button"
          data-preference="theme"
          onClick={() => setTheme(nextTheme)}
          title={themeLabel}
        >
          <ThemeIcon theme={theme} />
        </IconButton>
      ) : null}
      {showLanguage ? (
        <SegmentedControl
          ariaLabel={copy.preferences.language}
          onChange={(value) => setLanguage(value)}
          options={[
            {
              ariaLabel: copy.preferences.switchToEnglish,
              dataPreference: "language",
              label: "EN",
              value: "en",
            },
            {
              ariaLabel: copy.preferences.switchToSpanish,
              dataPreference: "language",
              label: "ES",
              value: "es",
            },
          ]}
          value={language}
        />
      ) : null}
    </div>
  );
}

function ThemeIcon({ theme }: { theme: "light" | "dark" }) {
  return theme === "light" ? (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path d="M20.8 15.1A8.7 8.7 0 0 1 8.9 3.2 8.8 8.8 0 1 0 20.8 15.1Z" />
    </svg>
  );
}
