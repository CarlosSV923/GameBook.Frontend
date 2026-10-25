import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/ui/auth-provider";
import { PreferencesProvider } from "@/features/preferences/ui/preferences-provider";
import { ThemeScript } from "@/features/preferences/ui/theme-script";
import { QueryProvider } from "@/shared/query/query-client-provider";

import "./globals.css";

const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/newsreader-latin-600-normal.woff2", weight: "600" },
  ],
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
  variable: "--font-newsreader",
});

const ibmPlexSans = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600" },
  ],
  display: "swap",
  fallback: ["Segoe UI", "Aptos", "system-ui", "sans-serif"],
  variable: "--font-ibm-plex-sans",
});

const ibmPlexMono = localFont({
  src: "./fonts/ibm-plex-mono-latin-500-normal.woff2",
  display: "swap",
  fallback: ["SFMono-Regular", "Consolas", "monospace"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "GameBook",
  description: "A curated video game archive and personal collection.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      className={`${newsreader.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
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
