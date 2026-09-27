"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/features/auth/auth-provider";
import { AuthForm } from "@/features/auth/auth-form";
import { PasswordChangedModal } from "@/features/auth/password-changed-modal";
import { AppShell } from "@/features/layout/app-shell";
import { usePreferences } from "@/features/preferences/preferences-provider";
import type { LoginUserInput, RegisterUserInput } from "@/shared/api/auth-user";

type LoginPageViewProps = {
  passwordChanged: boolean;
  registered: boolean;
};

export function LoginPageView({
  passwordChanged,
  registered,
}: LoginPageViewProps) {
  const { copy } = usePreferences();
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPasswordChangedModal, setShowPasswordChangedModal] =
    useState(passwordChanged);

  const login = async (
    values: RegisterUserInput | LoginUserInput,
  ): Promise<void> => {
    if ("fullName" in values) {
      return;
    }

    await signIn(values);
    router.push("/");
  };

  const closePasswordChangedModal = () => {
    setShowPasswordChangedModal(false);
    router.replace("/login");
  };

  return (
    <AppShell>
      <AuthForm
        mode="login"
        notice={registered ? copy.auth.login.registeredNotice : undefined}
        onSubmit={login}
      />
      {showPasswordChangedModal ? (
        <PasswordChangedModal onClose={closePasswordChangedModal} />
      ) : null}
    </AppShell>
  );
}
