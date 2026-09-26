"use client";

import { useState } from "react";

import { usePreferences } from "@/features/preferences/preferences-provider";

type PasswordInputProps = {
  ariaInvalid: boolean;
  autoComplete: string;
  describedBy?: string;
  id: string;
  minLength?: number;
  name: string;
  onChange: (value: string) => void;
  value: string;
};

export function PasswordInput({
  ariaInvalid,
  autoComplete,
  describedBy,
  id,
  minLength,
  name,
  onChange,
  value,
}: PasswordInputProps) {
  const { copy } = usePreferences();
  const [isVisible, setIsVisible] = useState(false);
  const actionLabel = isVisible
    ? copy.auth.fields.hidePassword
    : copy.auth.fields.showPassword;

  return (
    <div className="auth-form__password-control">
      <input
        aria-describedby={describedBy}
        aria-invalid={ariaInvalid}
        autoComplete={autoComplete}
        id={id}
        minLength={minLength}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        required
        type={isVisible ? "text" : "password"}
        value={value}
      />
      <button
        aria-label={actionLabel}
        aria-pressed={isVisible}
        className="auth-form__password-toggle"
        onClick={() => setIsVisible((current) => !current)}
        title={actionLabel}
        type="button"
      >
        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3 3l18 18M10.6 6.2A10.9 10.9 0 0 1 12 6c6.1 0 9.5 6 9.5 6a17.7 17.7 0 0 1-3 3.6M6.2 6.2A17.7 17.7 0 0 0 2.5 12S5.9 18 12 18c1.3 0 2.5-.3 3.5-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
