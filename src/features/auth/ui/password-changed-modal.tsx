"use client";

import { useEffect, useRef } from "react";

import { usePreferences } from "@/features/preferences/ui/preferences-provider";
import { Button } from "@/shared/ui/button";

type PasswordChangedModalProps = {
  onClose: () => void;
};

export function PasswordChangedModal({ onClose }: PasswordChangedModalProps) {
  const { copy } = usePreferences();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const modal = modalRef.current;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    modal?.querySelector<HTMLElement>("button")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modal) {
        return;
      }

      const focusableElements = Array.from(
        modal.querySelectorAll<HTMLElement>(
          "button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
        ),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!modal.contains(document.activeElement)) {
        event.preventDefault();
        firstElement.focus();
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [onClose]);

  return (
    <div
      aria-describedby="password-changed-description"
      aria-labelledby="password-changed-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-scrim p-4 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={modalRef}
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-panel border border-border-soft bg-paper-raised p-6 shadow-raised sm:p-9">
        <span
          aria-hidden="true"
          className="mb-5 grid size-10 place-items-center rounded-full border border-moss/50 bg-paper-inset font-data text-lg font-semibold text-ink"
        >
          ✓
        </span>
        <p className="mb-3 font-ui text-xs font-bold uppercase tracking-[0.12em] text-copper-strong">
          {copy.auth.profile.passwordTitle}
        </p>
        <h2
          className="mb-3 font-display text-3xl font-medium leading-tight tracking-tight text-ink"
          id="password-changed-title"
        >
          {copy.auth.profile.passwordChangedTitle}
        </h2>
        <p
          className="mb-7 text-sm leading-6 text-ink-secondary"
          id="password-changed-description"
        >
          {copy.auth.profile.passwordChangedDescription}
        </p>
        <Button onClick={onClose} type="button" variant="primary">
          {copy.auth.profile.passwordChangedAction}
        </Button>
      </div>
    </div>
  );
}
