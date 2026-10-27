"use client";

import { useSyncExternalStore } from "react";

import { usePreferences } from "@/features/preferences/ui/preferences-provider";
import {
  dismissServiceWarmupAlert,
  getServerServiceWarmupAlertSnapshot,
  getServiceWarmupAlertSnapshot,
  subscribeToServiceWarmupAlert,
} from "@/shared/api/service-warmup-alert";
import { IconButton } from "@/shared/ui/icon-button";

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
      className={`fixed right-4 top-[88px] z-40 grid w-[min(calc(100vw-32px),420px)] grid-cols-[4px_minmax(0,1fr)_44px] items-center gap-3 rounded-panel border border-border bg-paper-raised p-3 pl-4 text-ink shadow-raised transition-[opacity,transform,visibility] duration-200 motion-reduce:transition-none sm:right-[max(24px,calc((100vw-1120px)/2))] ${isVisible ? "translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0"}`}
      role="status"
    >
      <span
        aria-hidden="true"
        className="min-h-8 self-stretch rounded-sm bg-warning motion-safe:animate-pulse motion-reduce:animate-none"
      />
      <p className="m-0 text-sm font-medium leading-5 text-ink-secondary">
        {copy.serviceWarmup.message}
      </p>
      <IconButton
        aria-label={copy.serviceWarmup.dismiss}
        className="text-ink-muted"
        onClick={dismissServiceWarmupAlert}
      >
        <span aria-hidden="true" className="text-xl leading-none">
          ×
        </span>
      </IconButton>
    </div>
  );
}
