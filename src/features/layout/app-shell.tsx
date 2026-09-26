import type { ReactNode } from "react";

import { CatalogNavbar } from "@/features/navigation/catalog-navbar";

type AppShellProps = {
  authState?: "authenticated" | "anonymous";
  children: ReactNode;
};

export function AppShell({ authState = "anonymous", children }: AppShellProps) {
  return (
    <div className="app-shell">
      <CatalogNavbar authState={authState} />
      {children}
    </div>
  );
}
