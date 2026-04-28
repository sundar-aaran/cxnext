"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@cxnext/ui";
import { DeskBreadcrumb } from "./desk-breadcrumb";
import { getDeskPortal } from "./desk-registry";

function getPortalIdFromPath(pathname: string) {
  const [, root, portalId] = pathname.split("/");
  return root === "desk" ? portalId : undefined;
}

export function DeskShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const activePortal = getDeskPortal(getPortalIdFromPath(pathname));
  const navItems = activePortal.menuItems.map((item) => ({
    ...item,
    active: pathname === item.href || pathname.startsWith(`${item.href}/`),
  }));

  return (
    <DashboardShell
      brand="cxnext"
      workspace={activePortal.badge}
      navItems={navItems}
      header={<DeskBreadcrumb activePortal={activePortal} />}
    >
      {children}
    </DashboardShell>
  );
}
