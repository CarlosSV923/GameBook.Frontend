import { describe, expect, it } from "vitest";

import { messages } from "@/shared/i18n/messages";

describe("GameBook UI message catalog", () => {
  it("keeps English and Spanish message shapes aligned", () => {
    expect(Object.keys(messages.en)).toEqual(Object.keys(messages.es));
    expect(Object.keys(messages.en.navigation)).toEqual(
      Object.keys(messages.es.navigation),
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
    expect(Object.keys(messages.en.auth.register)).toEqual(
      Object.keys(messages.es.auth.register),
    );
    expect(Object.keys(messages.en.auth.validation)).toEqual(
      Object.keys(messages.es.auth.validation),
    );
    expect(Object.keys(messages.en.states)).toEqual(
      Object.keys(messages.es.states),
    );
    expect(Object.keys(messages.en.indexStrip)).toEqual(
      Object.keys(messages.es.indexStrip),
    );
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
});
