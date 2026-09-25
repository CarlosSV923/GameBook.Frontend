import { describe, expect, it } from "vitest";

import {
  isLanguage,
  isTheme,
  preferenceStorageKeys,
} from "@/shared/preferences/storage";

describe("preference storage contracts", () => {
  it("accepts only the supported theme values", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("system")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });

  it("accepts only the supported language values", () => {
    expect(isLanguage("en")).toBe(true);
    expect(isLanguage("es")).toBe(true);
    expect(isLanguage("fr")).toBe(false);
    expect(isLanguage(null)).toBe(false);
  });

  it("keeps stable local-storage keys for theme and language", () => {
    expect(preferenceStorageKeys).toEqual({
      language: "gamebook.language",
      theme: "gamebook.theme",
    });
  });
});
