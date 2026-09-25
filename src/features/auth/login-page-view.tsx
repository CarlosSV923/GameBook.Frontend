"use client";

import { createAuthUserClient } from "@/features/api/auth-user-client";
import { AuthForm } from "@/features/auth/auth-form";
import { AppShell } from "@/features/layout/app-shell";
import { usePreferences } from "@/features/preferences/preferences-provider";
import type { LoginUserInput, RegisterUserInput } from "@/shared/api/auth-user";

type LoginPageViewProps = {
  registered: boolean;
};

export function LoginPageView({ registered }: LoginPageViewProps) {
  const { copy } = usePreferences();

  const login = async (
    values: RegisterUserInput | LoginUserInput,
  ): Promise<void> => {
    if ("fullName" in values) {
      return;
    }

    await createAuthUserClient().login(values);
  };

  return (
    <AppShell>
      <AuthForm
        mode="login"
        notice={registered ? copy.auth.login.registeredNotice : undefined}
        onSubmit={login}
      />
    </AppShell>
  );
}
