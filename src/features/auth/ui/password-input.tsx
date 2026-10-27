"use client";

import { useState } from "react";

import { usePreferences } from "@/features/preferences/ui/preferences-provider";
import { IconButton } from "@/shared/ui/icon-button";
import { TextField } from "@/shared/ui/text-field";

type PasswordInputProps = {
  autoComplete: string;
  error?: string;
  hint?: string;
  id: string;
  label: string;
  minLength?: number;
  name: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
};

export function PasswordInput({
  autoComplete,
  error,
  hint,
  id,
  label,
  minLength,
  name,
  onChange,
  required = true,
  value,
}: PasswordInputProps) {
  const { copy } = usePreferences();
  const [isVisible, setIsVisible] = useState(false);
  const actionLabel = isVisible
    ? copy.auth.fields.hidePassword
    : copy.auth.fields.showPassword;

  return (
    <TextField
      autoComplete={autoComplete}
      endAdornment={
        <IconButton
          aria-label={actionLabel}
          onClick={() => setIsVisible((current) => !current)}
          pressed={isVisible}
          title={actionLabel}
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </IconButton>
      }
      error={error}
      hint={hint}
      id={id}
      label={label}
      minLength={minLength}
      name={name}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      type={isVisible ? "text" : "password"}
      value={value}
    />
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8]"
      viewBox="0 0 24 24"
    >
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8]"
      viewBox="0 0 24 24"
    >
      <path d="M3 3l18 18M10.6 6.2A10.9 10.9 0 0 1 12 6c6.1 0 9.5 6 9.5 6a17.7 17.7 0 0 1-3 3.6M6.2 6.2A17.7 17.7 0 0 0 2.5 12S5.9 18 12 18c1.3 0 2.5-.3 3.5-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
