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
      messages.en.navigation.catalog,
      messages.en.navigation.createAccount,
      messages.en.states.errorDescription,
      messages.en.states.errorTitle,
      messages.en.states.loading,
      messages.es.catalog.emptyDescription,
      messages.es.catalog.emptyTitle,
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
});
