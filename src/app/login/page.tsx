import { LoginPageView } from "@/features/auth/login-page-view";

type LoginPageProps = {
  searchParams: Promise<{
    passwordChanged?: string | string[];
    registered?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const registered = params.registered === "1";
  const passwordChanged = params.passwordChanged === "1";

  return (
    <LoginPageView passwordChanged={passwordChanged} registered={registered} />
  );
}
