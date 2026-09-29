import type { ReactNode } from "react";

import { CatalogNavbar } from "@/features/navigation/catalog-navbar";
import { ServiceWarmupAlert } from "@/shared/ui/service-warmup-alert";

type AppShellProps = {
  authState?: "authenticated" | "anonymous";
  children: ReactNode;
};

export function AppShell({ authState = "anonymous", children }: AppShellProps) {
  return (
    <div className="app-shell">
      <CatalogNavbar authState={authState} />
      <ServiceWarmupAlert />
      {children}
    </div>
  );
}
