"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { ApiClientError } from "@/shared/api/http";
import type { Messages } from "@/shared/i18n/messages";
import { usePreferences } from "@/features/preferences/preferences-provider";
import type { LoginUserInput, RegisterUserInput } from "@/shared/api/auth-user";
import {
  type AuthField,
  type AuthFieldErrors,
  type RegisterFormValues,
  validateLoginForm,
  validateRegisterForm,
} from "@/features/auth/auth-validation";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  notice?: string;
  onSubmit: (values: RegisterUserInput | LoginUserInput) => Promise<void>;
};

type FormValues = RegisterFormValues;
type FormStatus = "error" | "idle" | "submitting" | "success";

const emptyValues: FormValues = {
  email: "",
  fullName: "",
  password: "",
  passwordConfirmation: "",
};

export function AuthForm({ mode, notice, onSubmit }: AuthFormProps) {
  const { copy } = usePreferences();
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const content = mode === "register" ? copy.auth.register : copy.auth.login;
  const titleId = `auth-${mode}-title`;
  const alternateHref = mode === "register" ? "/login" : "/register";

  const updateField = (field: AuthField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
    if (status !== "idle") {
      setStatus("idle");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setStatus("idle");

    const errors =
      mode === "register"
        ? validateRegisterForm(values, copy.auth.validation)
        : validateLoginForm(values, copy.auth.validation);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus("error");
      return;
    }

    setFieldErrors({});
    setStatus("submitting");

    try {
      const input =
        mode === "register"
          ? {
              email: values.email.trim(),
              fullName: values.fullName.trim(),
              password: values.password,
              passwordConfirmation: values.passwordConfirmation,
            }
          : { email: values.email.trim(), password: values.password };

      await onSubmit(input);
      setStatus("success");
    } catch (error) {
      const result = getRequestError(error, copy, mode);
      setFieldErrors(result.fieldErrors);
      setFormError(result.formError);
      setStatus("error");
    }
  };

  return (
    <main className="auth-page">
      <section aria-labelledby={titleId} className="auth-panel">
        <header className="auth-panel__header">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 id={titleId}>{content.title}</h1>
          <p className="auth-panel__description">{content.description}</p>
        </header>

        {notice ? (
          <p className="auth-form__notice" role="status">
            {notice}
          </p>
        ) : null}

        <form className="auth-form" noValidate onSubmit={handleSubmit}>
          {mode === "register" ? (
            <AuthField
              autoComplete="name"
              error={fieldErrors.fullName}
              id="register-full-name"
              label={copy.auth.fields.fullName}
              onChange={(value) => updateField("fullName", value)}
              value={values.fullName}
            />
          ) : null}

          <AuthField
            autoComplete="email"
            error={fieldErrors.email}
            id={`${mode}-email`}
            inputMode="email"
            label={copy.auth.fields.email}
            onChange={(value) => updateField("email", value)}
            type="email"
            value={values.email}
          />

          <AuthField
            autoComplete={
              mode === "register" ? "new-password" : "current-password"
            }
            error={fieldErrors.password}
            hint={
              mode === "register" ? copy.auth.fields.passwordHint : undefined
            }
            id={`${mode}-password`}
            label={copy.auth.fields.password}
            onChange={(value) => updateField("password", value)}
            type="password"
            value={values.password}
          />

          {mode === "register" ? (
            <AuthField
              autoComplete="new-password"
              error={fieldErrors.passwordConfirmation}
              id="register-password-confirmation"
              label={copy.auth.fields.passwordConfirmation}
              onChange={(value) => updateField("passwordConfirmation", value)}
              type="password"
              value={values.passwordConfirmation}
            />
          ) : null}

          {formError ? (
            <p className="auth-form__error" role="alert">
              {formError}
            </p>
          ) : null}

          {status === "success" ? (
            <p className="auth-form__success" role="status">
              {content.success}
            </p>
          ) : null}

          <button
            className="catalog-filter-button auth-form__submit"
            disabled={status === "submitting"}
            type="submit"
          >
            {status === "submitting" ? content.submitting : content.submit}
          </button>
        </form>

        <p className="auth-panel__alternate">
          {content.alternate}{" "}
          <Link href={alternateHref}>{content.alternateAction}</Link>
        </p>
      </section>
    </main>
  );
}

type AuthFieldProps = {
  autoComplete: string;
  error?: string;
  hint?: string;
  id: string;
  inputMode?: "email" | "text";
  label: string;
  onChange: (value: string) => void;
  type?: "email" | "password" | "text";
  value: string;
};

function AuthField({
  autoComplete,
  error,
  hint,
  id,
  inputMode,
  label,
  onChange,
  type = "text",
  value,
}: AuthFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <label className="auth-form__field" htmlFor={id}>
      <span>{label}</span>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        id={id}
        inputMode={inputMode}
        name={id}
        onChange={(event) => onChange(event.target.value)}
        required
        type={type}
        value={value}
      />
      {hint ? (
        <span className="auth-form__hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="auth-form__field-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function getRequestError(
  error: unknown,
  copy: Messages,
  mode: AuthMode,
): { fieldErrors: AuthFieldErrors; formError: string } {
  if (!(error instanceof ApiClientError)) {
    return { fieldErrors: {}, formError: copy.auth.errors.generic };
  }

  if (error.code === "EMAIL_ALREADY_REGISTERED") {
    return {
      fieldErrors: { email: copy.auth.errors.duplicateEmail },
      formError: "",
    };
  }

  if (error.code === "INVALID_CREDENTIALS") {
    return { fieldErrors: {}, formError: copy.auth.errors.invalidCredentials };
  }

  if (error.code === "ACCOUNT_DISABLED") {
    return mode === "register"
      ? {
          fieldErrors: { email: copy.auth.errors.disabledEmail },
          formError: "",
        }
      : { fieldErrors: {}, formError: copy.auth.errors.disabledAccount };
  }

  if (error.status === 0 || error.status >= 500) {
    return { fieldErrors: {}, formError: copy.auth.errors.unavailable };
  }

  const fieldErrors: AuthFieldErrors = {};
  for (const detail of error.details) {
    if (isAuthField(detail.field)) {
      fieldErrors[detail.field] = getFieldError(detail.field, copy);
    }
  }

  return {
    fieldErrors,
    formError: copy.auth.errors.generic,
  };
}

function getFieldError(field: AuthField, copy: Messages): string {
  if (field === "email") {
    return copy.auth.validation.email;
  }

  if (field === "fullName") {
    return copy.auth.validation.fullName;
  }

  if (field === "passwordConfirmation") {
    return copy.auth.validation.passwordConfirmation;
  }

  return copy.auth.validation.password;
}

function isAuthField(value: string): value is AuthField {
  return (
    value === "email" ||
    value === "fullName" ||
    value === "password" ||
    value === "passwordConfirmation"
  );
}
