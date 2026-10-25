import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/ui/auth-provider";
import { PreferencesProvider } from "@/features/preferences/ui/preferences-provider";
import { ThemeScript } from "@/features/preferences/ui/theme-script";
import { QueryProvider } from "@/shared/query/query-client-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "GameBook",
  description: "A curated video game archive and personal collection.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeScript />
        <QueryProvider>
          <AuthProvider>
            <PreferencesProvider>{children}</PreferencesProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
