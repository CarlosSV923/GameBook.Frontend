"use client";

import { useRouter } from "next/navigation";

import { createAuthUserClient } from "@/features/api/auth-user-client";
import { AuthForm } from "@/features/auth/auth-form";
import type { LoginUserInput, RegisterUserInput } from "@/shared/api/auth-user";
import { AppShell } from "@/features/layout/app-shell";

export default function RegisterPage() {
  const router = useRouter();

  const register = async (
    values: RegisterUserInput | LoginUserInput,
  ): Promise<void> => {
    if (!("fullName" in values)) {
      return;
    }

    await createAuthUserClient().register(values);
    router.push("/login?registered=1");
  };

  return (
    <AppShell>
      <AuthForm mode="register" onSubmit={register} />
    </AppShell>
  );
}
