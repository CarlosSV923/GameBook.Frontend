import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { messages } from "@/shared/i18n/messages";

vi.mock("@/features/preferences/ui/preferences-provider", () => ({
  usePreferences: () => ({ copy: messages.en }),
}));

vi.mock("@/shared/api/service-warmup-alert", () => ({
  dismissServiceWarmupAlert: vi.fn(),
  getServerServiceWarmupAlertSnapshot: () => ({ visible: true }),
  getServiceWarmupAlertSnapshot: () => ({ visible: true }),
  subscribeToServiceWarmupAlert: () => () => undefined,
}));

import { ServiceWarmupAlert } from "@/shared/ui/service-warmup-alert";

describe("ServiceWarmupAlert UI", () => {
  it("announces the warning and exposes a named dismiss action", () => {
    const markup = renderToStaticMarkup(createElement(ServiceWarmupAlert));

    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain(messages.en.serviceWarmup.message);
    expect(markup).toContain(
      `aria-label="${messages.en.serviceWarmup.dismiss}"`,
    );
    expect(markup).toContain("bg-warning");
    expect(markup).toContain('aria-hidden="false"');
  });
});
