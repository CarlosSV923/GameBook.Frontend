"use client";

import { usePreferences } from "@/features/preferences/preferences-provider";
import type { Language, Theme } from "@/shared/preferences/storage";
import { SegmentedControl } from "@/shared/ui/segmented-control";

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
        <p className="eyebrow">{copy.preferences.eyebrow}</p>
        <h2 id="preferences-title">{copy.preferences.title}</h2>
        <p>{copy.preferences.description}</p>
      </div>

      <div className="preference-panel__groups">
        <fieldset className="preference-group">
          <legend>{copy.preferences.theme}</legend>
          <SegmentedControl
            ariaLabel={copy.preferences.theme}
            onChange={setTheme}
            options={themeOptions.map((option) => ({
              label: themeLabels[option],
              value: option,
            }))}
            value={theme}
          />
        </fieldset>

        <fieldset className="preference-group">
          <legend>{copy.preferences.language}</legend>
          <SegmentedControl
            ariaLabel={copy.preferences.language}
            onChange={setLanguage}
            options={languageOptions.map((option) => ({
              label: languageLabels[option],
              value: option,
            }))}
            value={language}
          />
        </fieldset>
      </div>
    </section>
  );
}
