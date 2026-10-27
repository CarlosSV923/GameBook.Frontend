"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/features/auth/ui/auth-provider";
import { PasswordInput } from "@/features/auth/ui/password-input";
import {
  type ChangePasswordFieldErrors,
  validateChangePasswordForm,
} from "@/features/auth/model/auth-validation";
import { AppShell } from "@/features/layout/ui/app-shell";
import { usePreferences } from "@/features/preferences/ui/preferences-provider";
import type { ChangePasswordInput } from "@/features/auth/model/auth-user";
import { ApiClientError } from "@/shared/api/http";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";

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
      <main className="mx-auto grid w-full max-w-5xl gap-5 px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-5 lg:grid-cols-2">
          <section
            aria-labelledby="profile-title"
            className="rounded-panel border border-border-soft bg-paper-raised p-6 shadow-raised sm:p-8 lg:col-span-2"
          >
            <p className="mb-3 font-ui text-xs font-bold uppercase tracking-[0.12em] text-copper-strong">
              {copy.auth.profile.accountDetails}
            </p>
            <h1
              className="mb-3 font-display text-4xl font-medium leading-tight tracking-tight text-ink"
              id="profile-title"
            >
              {copy.navigation.profile}
            </h1>
            <p className="max-w-[54ch] text-sm leading-6 text-ink-secondary">
              {copy.auth.profile.description}
            </p>

            <dl className="mt-7 grid gap-4 border-t border-border-soft pt-5 sm:grid-cols-2">
              <div>
                <dt className="mb-1 font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  {copy.auth.profile.fullName}
                </dt>
                <dd className="break-words text-sm font-medium text-ink">
                  {user.fullName}
                </dd>
              </div>
              <div>
                <dt className="mb-1 font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  {copy.auth.profile.email}
                </dt>
                <dd className="break-words text-sm font-medium text-ink">
                  {user.email}
                </dd>
              </div>
            </dl>
          </section>

          <ChangePasswordCard />
          <AccountDeactivationCard />
        </div>
      </main>
    </AppShell>
  );
}

type AccountDeactivationState = "confirming" | "error" | "idle" | "submitting";

function AccountDeactivationCard() {
  const { copy } = usePreferences();
  const { disableAccount } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AccountDeactivationState>("idle");

  const handleConfirm = async () => {
    setState("submitting");

    try {
      await disableAccount();
      router.replace("/");
    } catch {
      setState("error");
    }
  };

  const isConfirming = state !== "idle";

  return (
    <section
      aria-labelledby="profile-disable-account-title"
      className="rounded-panel border border-danger/40 bg-paper-raised p-6 shadow-raised sm:p-8"
    >
      <p className="mb-3 font-ui text-xs font-bold uppercase tracking-[0.12em] text-danger">
        {copy.auth.profile.disableAccount}
      </p>
      <h2
        className="mb-3 font-display text-2xl font-medium leading-tight tracking-tight text-ink"
        id="profile-disable-account-title"
      >
        {copy.auth.profile.disableAccount}
      </h2>
      <p className="mb-6 max-w-[54ch] text-sm leading-6 text-ink-secondary">
        {copy.auth.profile.disableAccountDescription}
      </p>

      {!isConfirming ? (
        <Button
          className="border-danger/50 text-ink hover:border-danger hover:bg-danger/10"
          onClick={() => setState("confirming")}
          variant="secondary"
        >
          {copy.auth.profile.disableAccount}
        </Button>
      ) : null}

      {isConfirming ? (
        <div
          aria-live="polite"
          className="grid gap-4 border-l-2 border-danger bg-paper-inset p-4"
          role="alert"
        >
          <p>{copy.auth.profile.disableAccountConfirm}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={state === "submitting"}
              onClick={() => setState("idle")}
              variant="secondary"
            >
              {copy.auth.profile.disableAccountCancel}
            </Button>
            <Button
              className="border-danger bg-danger text-paper-raised hover:brightness-95"
              disabled={state === "submitting"}
              onClick={() => void handleConfirm()}
              variant="secondary"
            >
              {state === "submitting"
                ? copy.auth.profile.disablingAccount
                : copy.auth.profile.disableAccount}
            </Button>
          </div>
          {state === "error" ? (
            <p className="text-sm font-medium leading-5 text-ink" role="alert">
              {copy.auth.errors.generic}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
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
      className="rounded-panel border border-border-soft bg-paper-raised p-6 shadow-raised sm:p-8"
    >
      <p className="mb-3 font-ui text-xs font-bold uppercase tracking-[0.12em] text-copper-strong">
        {copy.auth.profile.passwordTitle}
      </p>
      <h2
        className="mb-3 font-display text-2xl font-medium leading-tight tracking-tight text-ink"
        id="profile-password-title"
      >
        {copy.auth.profile.passwordTitle}
      </h2>
      <p className="mb-6 text-sm leading-6 text-ink-secondary">
        {copy.auth.profile.passwordDescription}
      </p>

      <form className="grid gap-5" onSubmit={handleSubmit}>
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
          <p
            className="border-l-2 border-danger bg-paper-inset px-4 py-3 text-sm leading-5 text-ink"
            role="alert"
          >
            {formError}
          </p>
        ) : null}

        <Button
          className="w-full sm:w-auto"
          loading={submitting}
          type="submit"
          variant="primary"
        >
          {submitting ? copy.auth.profile.submitting : copy.auth.profile.submit}
        </Button>
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
  return (
    <PasswordInput
      autoComplete={autoComplete}
      error={error}
      hint={hint}
      id={id}
      label={label}
      minLength={id === "profile-new-password" ? 8 : 1}
      name={id}
      onChange={onChange}
      value={value}
    />
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
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section
        className="flex max-w-2xl gap-4 rounded-panel border border-border-soft bg-paper-raised p-6 shadow-raised sm:p-8"
        role={action ? "alert" : "status"}
      >
        <span aria-hidden="true" className="w-1 shrink-0 bg-copper" />
        <div className="grid gap-4">
          <p className="font-display text-2xl font-medium text-ink">GameBook</p>
          <p className="text-sm leading-6 text-ink-secondary">{message}</p>
          {action && href ? (
            <Link
              className="font-semibold text-copper-strong underline underline-offset-4"
              href={href}
            >
              {action}
            </Link>
          ) : null}
        </div>
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
