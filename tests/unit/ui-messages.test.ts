import { describe, expect, it } from "vitest";

import { messages } from "@/shared/i18n/messages";

describe("GameBook UI message catalog", () => {
  it("keeps English and Spanish message shapes aligned", () => {
    expect(Object.keys(messages.en)).toEqual(Object.keys(messages.es));
    expect(Object.keys(messages.en.navigation)).toEqual(
      Object.keys(messages.es.navigation),
    );
    expect(Object.keys(messages.en.home)).toEqual(
      Object.keys(messages.es.home),
    );
    expect(Object.keys(messages.en.catalog)).toEqual(
      Object.keys(messages.es.catalog),
    );
    expect(Object.keys(messages.en.auth)).toEqual(
      Object.keys(messages.es.auth),
    );
    expect(Object.keys(messages.en.auth.fields)).toEqual(
      Object.keys(messages.es.auth.fields),
    );
    expect(Object.keys(messages.en.auth.errors)).toEqual(
      Object.keys(messages.es.auth.errors),
    );
    expect(Object.keys(messages.en.auth.login)).toEqual(
      Object.keys(messages.es.auth.login),
    );
    expect(Object.keys(messages.en.auth.profile)).toEqual(
      Object.keys(messages.es.auth.profile),
    );
    expect(Object.keys(messages.en.auth.register)).toEqual(
      Object.keys(messages.es.auth.register),
    );
    expect(Object.keys(messages.en.auth.validation)).toEqual(
      Object.keys(messages.es.auth.validation),
    );
    expect(Object.keys(messages.en.states)).toEqual(
      Object.keys(messages.es.states),
    );
    expect(Object.keys(messages.en.preferences)).toEqual(
      Object.keys(messages.es.preferences),
    );
    expect(Object.keys(messages.en.indexStrip)).toEqual(
      Object.keys(messages.es.indexStrip),
    );
  });

  it("keeps every translated leaf present and non-empty in both languages", () => {
    const englishLeaves = collectMessageLeaves(messages.en);
    const spanishLeaves = collectMessageLeaves(messages.es);

    expect(Object.keys(spanishLeaves).sort()).toEqual(
      Object.keys(englishLeaves).sort(),
    );
    expect(Object.values(englishLeaves).every(isNonEmptyMessage)).toBe(true);
    expect(Object.values(spanishLeaves).every(isNonEmptyMessage)).toBe(true);
  });

  it("does not leave user-facing base-state messages blank", () => {
    const requiredMessages = [
      messages.en.catalog.emptyDescription,
      messages.en.catalog.emptyTitle,
      messages.en.catalog.attribution,
      messages.en.catalog.attributionLink,
      messages.en.auth.fields.email,
      messages.en.auth.login.submit,
      messages.en.auth.register.submit,
      messages.en.navigation.catalog,
      messages.en.navigation.createAccount,
      messages.en.states.errorDescription,
      messages.en.states.errorTitle,
      messages.en.states.loading,
      messages.es.catalog.emptyDescription,
      messages.es.catalog.emptyTitle,
      messages.es.catalog.attribution,
      messages.es.catalog.attributionLink,
      messages.es.auth.fields.email,
      messages.es.auth.login.submit,
      messages.es.auth.register.submit,
      messages.es.navigation.catalog,
      messages.es.navigation.createAccount,
      messages.es.states.errorDescription,
      messages.es.states.errorTitle,
      messages.es.states.loading,
    ];

    expect(requiredMessages.every((message) => message.trim().length > 0)).toBe(
      true,
    );
  });

  it("keeps the external attribution anchored to IGDB", () => {
    expect(messages.en.catalog.attributionLink).toBe("IGDB");
    expect(messages.es.catalog.attributionLink).toBe("IGDB");
  });

  it("uses concise search actions in both languages", () => {
    expect(messages.en.catalog.applyFilters).toBe("Search");
    expect(messages.en.catalog.clearFilters).toBe("Clear");
    expect(messages.es.catalog.applyFilters).toBe("Buscar");
    expect(messages.es.catalog.clearFilters).toBe("Limpiar");
  });

  it("describes suggestion searches in both languages", () => {
    expect(messages.en.catalog.searchingSuggestions).toBe(
      "Searching suggestions…",
    );
    expect(messages.es.catalog.searchingSuggestions).toBe("Buscando opciones…");
  });

  it("provides translated password visibility actions", () => {
    expect(messages.en.auth.fields.showPassword).toBe("Show password");
    expect(messages.en.auth.fields.hidePassword).toBe("Hide password");
    expect(messages.es.auth.fields.showPassword).toBe("Mostrar contraseña");
    expect(messages.es.auth.fields.hidePassword).toBe("Ocultar contraseña");
  });
});

function collectMessageLeaves(
  value: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  return Object.entries(value).reduce<Record<string, string>>(
    (leaves, [key, child]) => {
      const path = prefix ? `${prefix}.${key}` : key;

      if (typeof child === "string") {
        leaves[path] = child;
        return leaves;
      }

      Object.assign(
        leaves,
        collectMessageLeaves(child as Record<string, unknown>, path),
      );
      return leaves;
    },
    {},
  );
}

function isNonEmptyMessage(message: string): boolean {
  return message.trim().length > 0;
}
