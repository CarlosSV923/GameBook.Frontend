"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/auth-provider";
import { AuthForm } from "@/features/auth/auth-form";
import { AppShell } from "@/features/layout/app-shell";
import { usePreferences } from "@/features/preferences/preferences-provider";
import type { LoginUserInput, RegisterUserInput } from "@/shared/api/auth-user";

type LoginPageViewProps = {
  registered: boolean;
};

export function LoginPageView({ registered }: LoginPageViewProps) {
  const { copy } = usePreferences();
  const router = useRouter();
  const { signIn } = useAuth();

  const login = async (
    values: RegisterUserInput | LoginUserInput,
  ): Promise<void> => {
    if ("fullName" in values) {
      return;
    }

    await signIn(values);
    router.push("/");
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
