import type { ReactNode } from "react";
import { Boxes, LayoutDashboard, Network, Settings } from "lucide-react";
import { DashboardShell } from "@cxnext/ui";

const navItems = [
  { href: "/desk", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, active: true },
  { href: "/desk#modules", label: "Modules", icon: <Boxes className="h-4 w-4" /> },
  { href: "/desk#events", label: "Events", icon: <Network className="h-4 w-4" /> },
  { href: "/desk#settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
] as const;

export default function AppLayout({ children }: { readonly children: ReactNode }) {
  return (
    <DashboardShell brand="cxnext" workspace="desk" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
