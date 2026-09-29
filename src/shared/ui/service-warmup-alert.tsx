"use client";

import { useSyncExternalStore } from "react";

import { usePreferences } from "@/features/preferences/preferences-provider";
import {
  dismissServiceWarmupAlert,
  getServerServiceWarmupAlertSnapshot,
  getServiceWarmupAlertSnapshot,
  subscribeToServiceWarmupAlert,
} from "@/shared/api/service-warmup-alert";

export function ServiceWarmupAlert() {
  const { copy } = usePreferences();
  const isVisible = useSyncExternalStore(
    subscribeToServiceWarmupAlert,
    getServiceWarmupAlertSnapshot,
    getServerServiceWarmupAlertSnapshot,
  ).visible;

  return (
    <div
      aria-atomic="true"
      aria-hidden={!isVisible}
      aria-live="polite"
      className={`service-warmup-alert${isVisible ? "" : " service-warmup-alert--hidden"}`}
      role="status"
    >
      <span aria-hidden="true" className="service-warmup-alert__marker" />
      <p>{copy.serviceWarmup.message}</p>
      <button
        aria-label={copy.serviceWarmup.dismiss}
        className="service-warmup-alert__dismiss"
        onClick={dismissServiceWarmupAlert}
        type="button"
      >
        ×
      </button>
    </div>
  );
}
