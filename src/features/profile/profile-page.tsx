"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/features/auth/auth-provider";
import { PasswordInput } from "@/features/auth/password-input";
import {
  type ChangePasswordFieldErrors,
  validateChangePasswordForm,
} from "@/features/auth/auth-validation";
import { AppShell } from "@/features/layout/app-shell";
import { usePreferences } from "@/features/preferences/preferences-provider";
import type { ChangePasswordInput } from "@/shared/api/auth-user";
import { ApiClientError } from "@/shared/api/http";
import type { Messages } from "@/shared/i18n/messages";

export function ProfilePage() {
  const { copy } = usePreferences();
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "loading") {
    return (
      <AppShell>
        <ProfileState message={copy.auth.profile.loading} />
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <ProfileState
          action={copy.navigation.signIn}
          href="/login"
          message={copy.auth.profile.required}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="profile-page">
        <div className="profile-grid">
          <section
            aria-labelledby="profile-title"
            className="profile-card profile-card--identity"
          >
            <p className="eyebrow">{copy.auth.profile.accountDetails}</p>
            <h1 id="profile-title">{copy.navigation.profile}</h1>
            <p className="profile-card__description">
              {copy.auth.profile.description}
            </p>

            <dl className="profile-identity">
              <div>
                <dt>{copy.auth.profile.fullName}</dt>
                <dd>{user.fullName}</dd>
              </div>
              <div>
                <dt>{copy.auth.profile.email}</dt>
                <dd>{user.email}</dd>
              </div>
            </dl>
          </section>

          <ChangePasswordCard />
        </div>
      </main>
    </AppShell>
  );
}

function ChangePasswordCard() {
  const { copy } = usePreferences();
  const { changePassword } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ChangePasswordFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (
    field: "currentPassword" | "newPassword",
    value: string,
  ) => {
    if (field === "currentPassword") {
      setCurrentPassword(value);
    } else {
      setNewPassword(value);
    }

    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const errors = validateChangePasswordForm(
      { currentPassword, newPassword },
      {
        newPassword: copy.auth.validation.password,
        required: copy.auth.validation.required,
      },
    );

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    const input: ChangePasswordInput = { currentPassword, newPassword };

    try {
      await changePassword(input);
      router.push("/login?passwordChanged=1");
    } catch (error) {
      const result = getPasswordChangeError(error, copy);
      setFieldErrors(result.fieldErrors);
      setFormError(result.formError);
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="profile-password-title"
      className="profile-card profile-card--security"
    >
      <p className="eyebrow">{copy.auth.profile.passwordTitle}</p>
      <h2 id="profile-password-title">{copy.auth.profile.passwordTitle}</h2>
      <p className="profile-card__description">
        {copy.auth.profile.passwordDescription}
      </p>

      <form className="profile-form auth-form" onSubmit={handleSubmit}>
        <PasswordField
          autoComplete="current-password"
          error={fieldErrors.currentPassword}
          id="profile-current-password"
          label={copy.auth.profile.currentPassword}
          onChange={(value) => updateField("currentPassword", value)}
          value={currentPassword}
        />
        <PasswordField
          autoComplete="new-password"
          error={fieldErrors.newPassword}
          hint={copy.auth.fields.passwordHint}
          id="profile-new-password"
          label={copy.auth.profile.newPassword}
          onChange={(value) => updateField("newPassword", value)}
          value={newPassword}
        />

        {formError ? (
          <p className="auth-form__error" role="alert">
            {formError}
          </p>
        ) : null}

        <button
          aria-busy={submitting}
          className="catalog-filter-button auth-form__submit"
          disabled={submitting}
          type="submit"
        >
          {submitting ? (
            <>
              <span aria-hidden="true" className="loading-spinner" />
              {copy.auth.profile.submitting}
            </>
          ) : (
            copy.auth.profile.submit
          )}
        </button>
      </form>
    </section>
  );
}

type PasswordFieldProps = {
  autoComplete: string;
  error?: string;
  hint?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
};

function PasswordField({
  autoComplete,
  error,
  hint,
  id,
  label,
  onChange,
  value,
}: PasswordFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="auth-form__field">
      <label htmlFor={id}>{label}</label>
      <PasswordInput
        ariaInvalid={Boolean(error)}
        autoComplete={autoComplete}
        describedBy={describedBy}
        id={id}
        minLength={id === "profile-new-password" ? 8 : 1}
        name={id}
        onChange={onChange}
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
    </div>
  );
}

function ProfileState({
  action,
  href,
  message,
}: {
  action?: string;
  href?: string;
  message: string;
}) {
  return (
    <main className="profile-page">
      <section className="profile-state" role={action ? "alert" : "status"}>
        <p className="eyebrow">GameBook</p>
        <p>{message}</p>
        {action && href ? <Link href={href}>{action}</Link> : null}
      </section>
    </main>
  );
}

function getPasswordChangeError(
  error: unknown,
  copy: Messages,
): { fieldErrors: ChangePasswordFieldErrors; formError: string } {
  if (!(error instanceof ApiClientError)) {
    return { fieldErrors: {}, formError: copy.auth.errors.generic };
  }

  if (error.code === "INVALID_CREDENTIALS") {
    return {
      fieldErrors: { currentPassword: copy.auth.errors.invalidCredentials },
      formError: "",
    };
  }

  if (error.status === 0 || error.status >= 500) {
    return { fieldErrors: {}, formError: copy.auth.errors.unavailable };
  }

  if (error.details.some((detail) => detail.field === "newPassword")) {
    return {
      fieldErrors: { newPassword: copy.auth.validation.password },
      formError: "",
    };
  }

  return { fieldErrors: {}, formError: copy.auth.errors.generic };
}
