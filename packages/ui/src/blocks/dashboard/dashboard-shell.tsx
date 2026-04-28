import type { ReactNode } from "react";
import { Badge } from "../../components/badge";
import { Separator } from "../../components/separator";
import { cn } from "../../lib";

export interface DashboardNavItem {
  readonly href: string;
  readonly label: string;
  readonly icon?: ReactNode;
  readonly active?: boolean;
}

export interface DashboardShellProps {
  readonly brand: string;
  readonly workspace: string;
  readonly navItems: readonly DashboardNavItem[];
  readonly children: ReactNode;
  readonly className?: string;
}

export function DashboardShell({
  brand,
  workspace,
  navItems,
  children,
  className,
}: DashboardShellProps) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[260px_1fr]", className)}>
      <aside className="border-b border-border bg-muted/30 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center justify-between px-5">
          <div>
            <p className="text-sm font-semibold">{brand}</p>
            <p className="text-xs text-muted-foreground">Workspace: {workspace}</p>
          </div>
          <Badge variant="secondary">desk</Badge>
        </div>
        <Separator />
        <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-visible">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 min-w-fit items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                item.active && "bg-accent text-accent-foreground",
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
