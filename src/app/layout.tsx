import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/auth-provider";
import { PreferencesProvider } from "@/features/preferences/preferences-provider";
import { ThemeScript } from "@/features/preferences/theme-script";

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
        <AuthProvider>
          <PreferencesProvider>{children}</PreferencesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
