"use client";

import { useEffect, useRef } from "react";

import { usePreferences } from "@/features/preferences/preferences-provider";

type PasswordChangedModalProps = {
  onClose: () => void;
};

export function PasswordChangedModal({ onClose }: PasswordChangedModalProps) {
  const { copy } = usePreferences();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const modal = modalRef.current;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

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

      if (event.shiftKey && document.activeElement === firstElement) {
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
      className="auth-success-modal"
      ref={modalRef}
      role="dialog"
    >
      <div className="auth-success-modal__panel">
        <span aria-hidden="true" className="auth-success-modal__marker">
          ✓
        </span>
        <p className="auth-success-modal__eyebrow">
          {copy.auth.profile.passwordTitle}
        </p>
        <h2 id="password-changed-title">
          {copy.auth.profile.passwordChangedTitle}
        </h2>
        <p id="password-changed-description">
          {copy.auth.profile.passwordChangedDescription}
        </p>
        <button
          className="catalog-filter-button auth-success-modal__action"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          {copy.auth.profile.passwordChangedAction}
        </button>
      </div>
    </div>
  );
}
