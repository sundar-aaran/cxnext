"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@cxnext/ui";
import rootPackage from "../../../../package.json";
import { getDeskPortal } from "./desk-registry";

function getPortalIdFromPath(pathname: string) {
  const [, root, portalId] = pathname.split("/");
  return root === "desk" ? portalId : undefined;
}

export function DeskShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const isDeskRoot = pathname === "/desk";
  const activePortal = getDeskPortal(getPortalIdFromPath(pathname));
  const navItems = activePortal.menuItems.map((item) => ({
    ...item,
    active: pathname === item.href || pathname.startsWith(`${item.href}/`),
  }));

  return (
    <DashboardShell
      brand="CODEXSUN COMME..."
      workspace={isDeskRoot ? "Application Desk" : activePortal.badge}
      navItems={navItems}
      shellTechnicalName={isDeskRoot ? "shell.application-desk" : `shell.${activePortal.id}`}
      version={rootPackage.version}
    >
      {children}
    </DashboardShell>
  );
}
