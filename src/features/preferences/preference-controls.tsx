"use client";

import { usePreferences } from "@/features/preferences/preferences-provider";
import type { Language, Theme } from "@/shared/preferences/storage";

const themeOptions: Theme[] = ["light", "dark"];
const languageOptions: Language[] = ["en", "es"];

export function PreferenceControls() {
  const { copy, language, setLanguage, setTheme, theme } = usePreferences();

  const themeLabels: Record<Theme, string> = {
    dark: copy.preferences.dark,
    light: copy.preferences.light,
  };
  const languageLabels: Record<Language, string> = {
    en: copy.preferences.english,
    es: copy.preferences.spanish,
  };

  return (
    <section className="preference-panel" aria-labelledby="preferences-title">
      <div className="preference-panel__intro">
        <p className="eyebrow">{copy.home.eyebrow}</p>
        <h2 id="preferences-title">{copy.preferences.title}</h2>
        <p>{copy.preferences.description}</p>
      </div>

      <div className="preference-panel__groups">
        <fieldset className="preference-group">
          <legend>{copy.preferences.theme}</legend>
          <div className="preference-options">
            {themeOptions.map((option) => (
              <button
                aria-pressed={theme === option}
                className="preference-option"
                data-selected={theme === option}
                key={option}
                onClick={() => setTheme(option)}
                type="button"
              >
                {themeLabels[option]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="preference-group">
          <legend>{copy.preferences.language}</legend>
          <div className="preference-options">
            {languageOptions.map((option) => (
              <button
                aria-pressed={language === option}
                className="preference-option"
                data-selected={language === option}
                key={option}
                onClick={() => setLanguage(option)}
                type="button"
              >
                {languageLabels[option]}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  );
}
