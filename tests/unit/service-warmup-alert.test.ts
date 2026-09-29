import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  dismissServiceWarmupAlert,
  getServiceWarmupAlertSnapshot,
  reportHealthcheckFirstFailure,
  reportHealthcheckRecovery,
  serviceWarmupAlertDurationMs,
} from "@/shared/api/service-warmup-alert";

describe("service warmup alert", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    dismissServiceWarmupAlert();
  });

  afterEach(() => {
    dismissServiceWarmupAlert();
    vi.useRealTimers();
  });

  it("appears after the first healthcheck failure", () => {
    reportHealthcheckFirstFailure("https://auth.example.test");

    expect(getServiceWarmupAlertSnapshot()).toEqual({ visible: true });
  });

  it("disappears after the service recovers", () => {
    reportHealthcheckFirstFailure("https://game.example.test");
    reportHealthcheckRecovery("https://game.example.test");

    expect(getServiceWarmupAlertSnapshot()).toEqual({ visible: false });
  });

  it("auto-dismisses after 30 seconds", () => {
    reportHealthcheckFirstFailure("https://auth.example.test");

    vi.advanceTimersByTime(serviceWarmupAlertDurationMs - 1);
    expect(getServiceWarmupAlertSnapshot()).toEqual({ visible: true });

    vi.advanceTimersByTime(1);
    expect(getServiceWarmupAlertSnapshot()).toEqual({ visible: false });
  });

  it("allows the user to dismiss all active service notices", () => {
    reportHealthcheckFirstFailure("https://auth.example.test");
    reportHealthcheckFirstFailure("https://game.example.test");
    dismissServiceWarmupAlert();

    expect(getServiceWarmupAlertSnapshot()).toEqual({ visible: false });
  });

  it("does not reopen or duplicate a notice for the same service", () => {
    reportHealthcheckFirstFailure("https://auth.example.test");
    reportHealthcheckFirstFailure("https://auth.example.test");
    reportHealthcheckRecovery("https://game.example.test");

    expect(getServiceWarmupAlertSnapshot()).toEqual({ visible: true });
  });
});
