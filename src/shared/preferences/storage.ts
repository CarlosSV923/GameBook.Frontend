export type Theme = "light" | "dark";
export type Language = "en" | "es";

export const preferenceStorageKeys = {
  language: "gamebook.language",
  theme: "gamebook.theme",
} as const;

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "es";
}
