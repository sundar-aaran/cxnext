"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardShell } from "@cxnext/ui";
import {
  Building2,
  Contact,
  CreditCard,
  Factory,
  Flag,
  HandCoins,
  Package,
  ReceiptText,
  ShoppingBag,
  Users,
  WalletCards,
} from "lucide-react";
import rootPackage from "../../../../../../package.json";
import type { AuthSession } from "../../../auth/domain/auth";
import { logout } from "../../../auth/infrastructure/auth-api";
import { readStoredAuthSession } from "../../../auth/infrastructure/session-storage";
import { commonMenuGroups, commonMenuLabels } from "../../../common/application/common-service";
import { getDeskPortal } from "../../application/desk-registry";

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

const adminNavItems = [
  {
    id: "admin-users",
    label: "Users",
    href: "/desk/admin/users",
    icon: <Users className="h-4 w-4" />,
  },
] as const;

const masterNavItems = [
  {
    id: "contact",
    label: "Contact",
    href: "/desk/contact",
    icon: <Contact className="h-4 w-4" />,
  },
  {
    id: "product",
    label: "Product",
    href: "/desk/product",
    icon: <Package className="h-4 w-4" />,
  },
] as const;

const entriesNavItems = [
  {
    id: "sales",
    label: "Sales",
    href: "/desk/sales",
    icon: <ReceiptText className="h-4 w-4" />,
  },
  {
    id: "purchase",
    label: "Purchase",
    href: "/desk/purchase",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  {
    id: "payment",
    label: "Payment",
    href: "/desk/payment",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    id: "receipt",
    label: "Receipt",
    href: "/desk/receipt",
    icon: <HandCoins className="h-4 w-4" />,
  },
] as const;

const entriesMenuLabels: Record<string, string> = Object.fromEntries(
  entriesNavItems.map((item) => [item.id, item.label]),
);

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
  if (root === "desk" && portalId && entriesMenuLabels[portalId]) {
    return entriesMenuLabels[portalId];
  }

  if (root === "desk" && portalId === "common" && moduleKey) {
    return commonMenuLabels[moduleKey] ?? "Common";
  }

  return fallbackLabel;
}

export function DeskShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const isDeskRoot = pathname === "/desk";
  const activePortal = getDeskPortal(getPortalIdFromPath(pathname));
  const workspaceLabel = getWorkspaceLabel(pathname, isDeskRoot, activePortal.badge);
  const navItems = organisationNavItems.map((item) => ({
    ...item,
    active: pathname === item.href || pathname.startsWith(`${item.href}/`),
  }));
  const masterItems = masterNavItems.map((item) => ({
    ...item,
    active: pathname === item.href || pathname.startsWith(`${item.href}/`),
  }));
  const entriesItems = entriesNavItems.map((item) => ({
    ...item,
    active: pathname === item.href || pathname.startsWith(`${item.href}/`),
  }));
  const adminItems = adminNavItems.map((item) => ({
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

  useEffect(() => {
    setSession(readStoredAuthSession());
  }, [pathname]);

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <DashboardShell
      brand="CODEXSUN COMME..."
      currentUser={
        session
          ? {
              name: session.user.displayName,
              email: session.user.email,
            }
          : undefined
      }
      workspace={workspaceLabel}
      navItems={[...navItems, ...masterItems, ...entriesItems, ...adminItems]}
      navGroups={[
        {
          id: "organisation",
          label: "Organisation",
          icon: <Building2 className="size-4" />,
          items: navItems,
        },
        {
          id: "master",
          label: "Master",
          icon: <Contact className="size-4" />,
          items: masterItems,
        },
        {
          id: "entries",
          label: "Entries",
          icon: <ReceiptText className="size-4" />,
          items: entriesItems,
        },
        {
          id: "admin",
          label: "Admin",
          icon: <Users className="size-4" />,
          items: adminItems,
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
      onLogout={() => {
        void handleLogout();
      }}
    >
      {children}
    </DashboardShell>
  );
}
