import { LoginPageView } from "@/features/auth/login-page-view";

type LoginPageProps = {
  searchParams: Promise<{ registered?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const registered = params.registered === "1";

  return <LoginPageView registered={registered} />;
}
