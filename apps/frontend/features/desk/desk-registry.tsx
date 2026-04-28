import type { ReactNode } from "react";
import { Building2, Crown, LayoutDashboard, Settings, ShieldCheck, Store, Truck, Users } from "lucide-react";

export type DeskPortalId = "customer" | "vendor" | "admin" | "super-admin";

export interface DeskMenuItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon: ReactNode;
}

export interface DeskPortalDefinition {
  readonly id: DeskPortalId;
  readonly label: string;
  readonly href: string;
  readonly badge: string;
  readonly summary: string;
  readonly menuItems: readonly DeskMenuItem[];
}

function portalHref(portalId: DeskPortalId, hash?: string) {
  return hash ? `/desk/${portalId}#${hash}` : `/desk/${portalId}`;
}

export const deskPortals: readonly DeskPortalDefinition[] = [
  {
    id: "customer",
    label: "Customer Portal",
    href: "/desk/customer",
    badge: "Customer",
    summary: "Customer-facing workspace shell for future account, support, and activity surfaces.",
    menuItems: [
      { id: "customer-overview", label: "Overview", href: portalHref("customer"), icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: "customer-profile", label: "Profile", href: portalHref("customer", "profile"), icon: <Users className="h-4 w-4" /> },
      { id: "customer-requests", label: "Requests", href: portalHref("customer", "requests"), icon: <ShieldCheck className="h-4 w-4" /> },
    ],
  },
  {
    id: "vendor",
    label: "Vendor Portal",
    href: "/desk/vendor",
    badge: "Vendor",
    summary: "Vendor workspace shell for future onboarding, catalog, and operations surfaces.",
    menuItems: [
      { id: "vendor-overview", label: "Overview", href: portalHref("vendor"), icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: "vendor-company", label: "Company", href: portalHref("vendor", "company"), icon: <Building2 className="h-4 w-4" /> },
      { id: "vendor-operations", label: "Operations", href: portalHref("vendor", "operations"), icon: <Truck className="h-4 w-4" /> },
    ],
  },
  {
    id: "admin",
    label: "Admin Portal",
    href: "/desk/admin",
    badge: "Admin",
    summary: "Tenant administration workspace shell for future users, settings, and module controls.",
    menuItems: [
      { id: "admin-overview", label: "Overview", href: portalHref("admin"), icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: "admin-users", label: "Users", href: portalHref("admin", "users"), icon: <Users className="h-4 w-4" /> },
      { id: "admin-settings", label: "Settings", href: portalHref("admin", "settings"), icon: <Settings className="h-4 w-4" /> },
    ],
  },
  {
    id: "super-admin",
    label: "Super-admin Portal",
    href: "/desk/super-admin",
    badge: "Super-admin",
    summary: "Platform operator workspace shell for future tenants, governance, and release controls.",
    menuItems: [
      { id: "super-admin-overview", label: "Overview", href: portalHref("super-admin"), icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: "super-admin-tenants", label: "Tenants", href: portalHref("super-admin", "tenants"), icon: <Store className="h-4 w-4" /> },
      { id: "super-admin-governance", label: "Governance", href: portalHref("super-admin", "governance"), icon: <Crown className="h-4 w-4" /> },
    ],
  },
] as const;

export function getDeskPortal(portalId: string | undefined): DeskPortalDefinition {
  return deskPortals.find((portal) => portal.id === portalId) ?? deskPortals[0];
}
