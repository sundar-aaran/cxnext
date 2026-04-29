"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@cxnext/ui";
import {
  Building2,
  Contact,
  Factory,
  Flag,
  Package,
  ShoppingBag,
  Users,
  WalletCards,
} from "lucide-react";
import rootPackage from "../../../../package.json";
import { commonMenuGroups, commonMenuLabels } from "../common/application/common-service";
import { getDeskPortal } from "./desk-registry";

const organisationNavItems = [
  {
    id: "tenant",
    label: "Tenant",
    href: "/desk/tenant",
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: "industry",
    label: "Industry",
    href: "/desk/industry",
    icon: <Factory className="h-4 w-4" />,
  },
  {
    id: "company",
    label: "Company",
    href: "/desk/company",
    icon: <Building2 className="h-4 w-4" />,
  },
] as const;

const commonGroupIcons: Record<string, ReactNode> = {
  Location: <Flag className="h-4 w-4" />,
  Contacts: <Contact className="h-4 w-4" />,
  Product: <Package className="h-4 w-4" />,
  Orders: <ShoppingBag className="h-4 w-4" />,
  Others: <WalletCards className="h-4 w-4" />,
};

const commonSubGroups = commonMenuGroups.map((group) => ({
  id: `common-${group.label.toLowerCase()}`,
  label: group.label,
  icon: commonGroupIcons[group.label] ?? <Flag className="h-4 w-4" />,
  items: group.items.map((key) => ({
    id: `common-${key}`,
    label: commonMenuLabels[key] ?? key,
    href: `/desk/common/${key}`,
    active: false,
  })),
}));

function getPortalIdFromPath(pathname: string) {
  const [, root, portalId] = pathname.split("/");
  return root === "desk" ? portalId : undefined;
}

function getWorkspaceLabel(pathname: string, isDeskRoot: boolean, fallbackLabel: string) {
  if (isDeskRoot) {
    return "Application Desk";
  }

  const [, root, portalId, moduleKey] = pathname.split("/");
  if (root === "desk" && portalId === "common" && moduleKey) {
    return commonMenuLabels[moduleKey] ?? "Common";
  }

  return fallbackLabel;
}

export function DeskShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const isDeskRoot = pathname === "/desk";
  const activePortal = getDeskPortal(getPortalIdFromPath(pathname));
  const workspaceLabel = getWorkspaceLabel(pathname, isDeskRoot, activePortal.badge);
  const navItems = organisationNavItems.map((item) => ({
    ...item,
    active: pathname === item.href || pathname.startsWith(`${item.href}/`),
  }));
  const commonGroups = commonSubGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      active: pathname === item.href || pathname.startsWith(`${item.href}/`),
    })),
  }));

  return (
    <DashboardShell
      brand="CODEXSUN COMME..."
      workspace={workspaceLabel}
      navItems={navItems}
      navGroups={[
        {
          id: "organisation",
          label: "Organisation",
          icon: <Building2 className="size-4" />,
          items: navItems,
        },
        {
          id: "common",
          label: "Common",
          icon: <Flag className="size-4" />,
          subGroups: commonGroups,
        },
      ]}
      shellTechnicalName={
        isDeskRoot
          ? "shell.application-desk"
          : `shell.${getPortalIdFromPath(pathname) ?? activePortal.id}`
      }
      version={rootPackage.version}
    >
      {children}
    </DashboardShell>
  );
}
