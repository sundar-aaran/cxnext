"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  Boxes,
  Building2,
  Check,
  ChevronDown,
  ChevronsUpDown,
  CreditCard,
  Database,
  FlaskConical,
  Globe,
  Home,
  Images,
  KeyRound,
  LogOut,
  Mail,
  Menu,
  MoonStar,
  PackageCheck,
  Plus,
  ReceiptText,
  RefreshCcw,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SunMedium,
  Users,
  Warehouse,
  Wrench,
} from "lucide-react";
import { Button } from "../../components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/dropdown-menu";
import { Separator } from "../../components/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/tooltip";
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
  readonly header?: ReactNode;
  readonly className?: string;
  readonly shellTechnicalName?: string;
  readonly version?: string;
}

const switchableApps = [
  { id: "dashboard", label: "Dashboard", href: "/desk", icon: Home },
  { id: "ecommerce", label: "Ecommerce", href: "/desk/cxsun", icon: Boxes },
  { id: "billing", label: "Billing", href: "/desk/cxsun/records", icon: ReceiptText },
  { id: "stock", label: "Stock", href: "/desk/cxsun/queue", icon: Warehouse },
  { id: "frappe", label: "Frappe", href: "/desk/cxsun", icon: PackageCheck },
  { id: "site", label: "Site", href: "/desk/cxsun", icon: Globe },
  { id: "demo", label: "Demo", href: "/desk/cxsun", icon: FlaskConical },
  { id: "task", label: "Task", href: "/desk/cxsun/queue", icon: SlidersHorizontal },
  { id: "tally", label: "Tally", href: "/desk/cxsun/records", icon: Database },
  { id: "core", label: "Core", href: "/desk/cxsun", icon: Building2 },
  { id: "api", label: "API", href: "/desk/cxsun", icon: SlidersHorizontal },
  { id: "cli", label: "CLI", href: "/desk/cxsun", icon: Server },
  { id: "crm", label: "CRM", href: "/desk/cxsun", icon: Users },
  { id: "ui", label: "UI", href: "/desk/cxsun", icon: Boxes },
] as const;

const teams = [
  {
    id: "acme-inc",
    name: "Acme Inc",
    plan: "Enterprise",
    shortcut: "⌘1",
    icon: Building2,
  },
  {
    id: "acme-corp",
    name: "Acme Corp.",
    plan: "Growth",
    shortcut: "⌘2",
    icon: SlidersHorizontal,
  },
  {
    id: "evil-corp",
    name: "Evil Corp.",
    plan: "Audit",
    shortcut: "⌘3",
    icon: ShieldCheck,
  },
] as const;

const utilityGroups = [
  {
    id: "media",
    label: "Media",
    helper: "Assets, files, and media manager",
    href: "/desk",
    icon: Images,
  },
  {
    id: "mail",
    label: "Mail",
    helper: "Mail service and delivery settings",
    href: "/desk",
    icon: Mail,
  },
  {
    id: "users",
    label: "Users",
    helper: "Users, roles, and permissions",
    href: "/desk",
    icon: Users,
  },
  {
    id: "framework",
    label: "Framework",
    helper: "Companies, tenants, and core settings",
    href: "/desk",
    icon: Building2,
  },
  {
    id: "server-client",
    label: "Server / Client",
    helper: "Live servers and client keys",
    href: "/desk",
    icon: Server,
  },
  {
    id: "developer",
    label: "Developer",
    helper: "Audit, queues, backups, and updates",
    href: "/desk",
    icon: Wrench,
  },
  {
    id: "security",
    label: "Security",
    helper: "Review access and protections",
    href: "/desk",
    icon: ShieldCheck,
  },
  {
    id: "keys",
    label: "Keys",
    helper: "Generate and rotate access keys",
    href: "/desk",
    icon: KeyRound,
  },
  {
    id: "alerts",
    label: "Alerts",
    helper: "Operational notices and queues",
    href: "/desk/cxsun/queue",
    icon: Bell,
  },
  {
    id: "backup",
    label: "Backup",
    helper: "Database backup and restore",
    href: "/desk",
    icon: Database,
  },
  {
    id: "updates",
    label: "Updates",
    helper: "System update workflow",
    href: "/desk",
    icon: RefreshCcw,
  },
] as const;

const notifications = [
  {
    id: "queue",
    title: "Queue follow-up pending",
    message: "3 operational records are waiting for admin review.",
    createdAt: "2026-04-28T09:30:00+05:30",
    href: "/desk/cxsun/queue",
    isRead: false,
  },
  {
    id: "billing",
    title: "Billing sync completed",
    message: "Ledger and voucher summaries finished without blocking errors.",
    createdAt: "2026-04-28T08:45:00+05:30",
    href: "/desk/cxsun/records",
    isRead: true,
  },
] as const;

type NotificationId = (typeof notifications)[number]["id"];
type ThemeMode = "light" | "dark" | "system";
type AccentTheme = "neutral" | "orange" | "blue" | "green" | "purple";

const appearanceModes: readonly ThemeMode[] = ["light", "dark", "system"];
const accentThemes: readonly AccentTheme[] = ["neutral", "orange", "blue", "green", "purple"];

function getPreferredThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem("codexsun-theme-mode");

  if (storedTheme === "dark" || storedTheme === "light" || storedTheme === "system") {
    return storedTheme;
  }

  return "system";
}

function getPreferredAccentTheme(): AccentTheme {
  if (typeof window === "undefined") {
    return "neutral";
  }

  const storedAccent = window.localStorage.getItem("codexsun-theme-accent");

  if (
    storedAccent === "neutral" ||
    storedAccent === "orange" ||
    storedAccent === "blue" ||
    storedAccent === "green" ||
    storedAccent === "purple"
  ) {
    return storedAccent;
  }

  return "neutral";
}

function resolveDarkMode(mode: ThemeMode) {
  if (mode === "dark") {
    return true;
  }

  if (mode === "light") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(mode: ThemeMode, accent: AccentTheme) {
  if (typeof window === "undefined") {
    return;
  }

  const isDarkMode = resolveDarkMode(mode);

  document.documentElement.classList.toggle("dark", isDarkMode);
  document.documentElement.dataset.accent = accent;
}

function formatThemeLabel(value: ThemeMode | AccentTheme) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function sidebarLabelClass(hidden: boolean) {
  return cn(
    "min-w-0 overflow-hidden whitespace-nowrap transition-[opacity,transform,max-width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
    hidden
      ? "pointer-events-none max-w-0 -translate-x-2 opacity-0"
      : "max-w-[14rem] translate-x-0 opacity-100 delay-75",
  );
}

function formatDateTime(value: string) {
  const parsedValue = new Date(value);

  if (Number.isNaN(parsedValue.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedValue);
}

function toInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CN"
  );
}

export function DashboardShell({
  brand,
  workspace,
  children,
  className,
  shellTechnicalName,
  version = "0.0.0",
}: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [accentTheme, setAccentTheme] = useState<AccentTheme>("neutral");
  const [readNotificationIds, setReadNotificationIds] = useState<Set<NotificationId>>(
    () => new Set(notifications.filter((item) => item.isRead).map((item) => item.id)),
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !readNotificationIds.has(item.id)).length,
    [readNotificationIds],
  );

  function markAllNotificationsRead() {
    setReadNotificationIds(new Set(notifications.map((item) => item.id)));
  }

  function markNotificationRead(notificationId: NotificationId) {
    setReadNotificationIds((currentValue) => {
      const nextValue = new Set(currentValue);
      nextValue.add(notificationId);
      return nextValue;
    });
  }

  useEffect(() => {
    const preferredThemeMode = getPreferredThemeMode();
    const preferredAccentTheme = getPreferredAccentTheme();

    setThemeMode(preferredThemeMode);
    setAccentTheme(preferredAccentTheme);
    applyTheme(preferredThemeMode, preferredAccentTheme);
  }, []);

  useEffect(() => {
    applyTheme(themeMode, accentTheme);
  }, [accentTheme, themeMode]);

  useEffect(() => {
    if (themeMode !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      applyTheme("system", accentTheme);
    };

    mediaQuery.addEventListener("change", sync);

    return () => {
      mediaQuery.removeEventListener("change", sync);
    };
  }, [accentTheme, themeMode]);

  function setAppearanceMode(mode: ThemeMode) {
    setThemeMode(mode);
    window.localStorage.setItem("codexsun-theme-mode", mode);
    applyTheme(mode, accentTheme);
  }

  function setAccentMode(accent: AccentTheme) {
    setAccentTheme(accent);
    window.localStorage.setItem("codexsun-theme-accent", accent);
    applyTheme(themeMode, accent);
  }

  function renderSidebarContent({
    drawer = false,
  }: {
    readonly drawer?: boolean;
  } = {}) {
    const labelsHidden = !drawer && sidebarCollapsed;
    const majorVersion = version.split(".").at(0) || version;
    const compactVersionLabel = `v${majorVersion}`;
    const versionLabel = `v ${version}`;

    return (
      <>
        <div
          className={cn(
            "flex h-[70px] shrink-0 items-center gap-3 border-b border-sidebar-border px-3 transition-[padding,justify-content] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            !drawer && labelsHidden && "justify-center px-2",
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Switch team for ${brand}`}
                className={cn(
                  "group flex min-w-0 cursor-pointer items-center rounded-md outline-none transition-[background-color,gap,padding,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-sidebar-accent focus-visible:ring-1 focus-visible:ring-ring data-[state=open]:bg-sidebar-accent",
                  labelsHidden ? "justify-center p-0" : "w-full gap-3 p-2 text-left",
                )}
              >
                <span
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-md bg-foreground text-background shadow-sm transition-[width,height,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105",
                    labelsHidden ? "size-9" : "size-10",
                  )}
                >
                  <Building2 className="size-5" />
                </span>
                <span className={cn("min-w-0 flex-1", sidebarLabelClass(labelsHidden))}>
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {teams[0].name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {teams[0].plan}
                  </span>
                </span>
                <ChevronsUpDown
                  className={cn(
                    "size-4 text-muted-foreground transition-[opacity,transform,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    labelsHidden
                      ? "w-0 translate-x-1 opacity-0"
                      : "w-4 translate-x-0 opacity-100 delay-75",
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={labelsHidden ? "start" : "start"}
              side={labelsHidden ? "right" : "bottom"}
              sideOffset={labelsHidden ? 12 : 8}
              className="w-60 rounded-lg p-1"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Teams
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                {teams.map((team) => (
                  <DropdownMenuItem key={team.id} className="gap-3 rounded-md px-2 py-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                      <team.icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {team.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{team.shortcut}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-3 rounded-md px-2 py-2 text-muted-foreground">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                  <Plus className="size-4" />
                </span>
                <span className="font-medium">Add team</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav
          className={cn(
            "slim-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto py-8 transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            labelsHidden ? "px-2" : "px-3",
          )}
        >
          {utilityGroups.map((item) => {
            const menuItem = (
              <a
                key={item.id}
                href={item.href}
                aria-label={`${item.label}: ${item.helper}`}
                className={cn(
                  "group flex min-h-10 cursor-pointer items-center rounded-md text-sm font-semibold text-foreground transition-[background-color,padding,gap,justify-content,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-sidebar-accent",
                  labelsHidden ? "justify-center px-0" : "gap-3 px-3 py-2",
                )}
                onClick={() => {
                  if (drawer) {
                    setMobileSidebarOpen(false);
                  }
                }}
              >
                <item.icon className="size-4 shrink-0" />
                <span className={cn("flex-1", sidebarLabelClass(labelsHidden))}>
                  <span className="block truncate">{item.label}</span>
                  <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                    {item.helper}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "-rotate-90 size-4 text-muted-foreground transition-[opacity,transform,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    labelsHidden
                      ? "w-0 translate-x-1 opacity-0"
                      : "w-4 translate-x-0 opacity-100 delay-75",
                  )}
                />
              </a>
            );

            if (!labelsHidden) {
              return menuItem;
            }

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>{menuItem}</TooltipTrigger>
                <TooltipContent
                  side="right"
                  align="center"
                  sideOffset={12}
                  className="max-w-56 rounded-md bg-foreground px-3 py-2 text-background shadow-lg"
                >
                  <span className="block text-xs font-semibold">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-4 opacity-75">
                    {item.helper}
                  </span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-sidebar-border bg-sidebar">
          <div
            className={cn(
              "py-3 text-[11px] leading-4 text-muted-foreground transition-[padding,text-align] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              labelsHidden ? "px-1 text-center" : "px-3",
            )}
          >
            {labelsHidden ? compactVersionLabel : versionLabel}
          </div>
          <div className="px-2 pb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex w-full cursor-pointer items-center rounded-2xl border border-sidebar-border bg-background shadow-sm outline-none transition-[background-color,padding,gap,justify-content,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-sidebar-accent focus-visible:ring-1 focus-visible:ring-ring data-[state=open]:bg-sidebar-accent",
                    labelsHidden ? "justify-center px-2 py-2" : "gap-3 px-3 py-2 text-left",
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold">
                    {toInitials("Sundar")}
                  </span>
                  <span className={cn("flex-1", sidebarLabelClass(labelsHidden))}>
                    <span className="block truncate text-sm font-medium">Sundar</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      sundar@sundar.com
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted-foreground transition-[opacity,transform,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      labelsHidden
                        ? "w-0 translate-x-1 opacity-0"
                        : "w-4 translate-x-0 opacity-100 delay-75",
                    )}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side={labelsHidden ? "right" : "top"}
                className="min-w-56 rounded-lg"
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
                      {toInitials("Sundar")}
                    </span>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">Sundar</span>
                      <span className="truncate text-xs text-muted-foreground">
                        sundar@sundar.com
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles className="size-4" />
                    <span>Upgrade to Pro</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck className="size-4" />
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="size-4" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="size-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </>
    );
  }

  return (
    <TooltipProvider delayDuration={150} skipDelayDuration={80}>
      <div
        data-technical-name={shellTechnicalName}
        className={cn(
          "theme-shell h-screen overflow-hidden text-foreground transition-[grid-template-columns] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:grid lg:grid-cols-[278px_1fr]",
          sidebarCollapsed ? "lg:grid-cols-[62px_1fr]" : "lg:grid-cols-[278px_1fr]",
          className,
        )}
      >
        <aside
          data-collapsed={sidebarCollapsed}
          className="hidden h-screen min-h-0 overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex lg:flex-col"
        >
          {renderSidebarContent()}
        </aside>

        <main className="min-h-0 min-w-0">
          <div className="theme-shell flex h-screen min-h-0 flex-col overflow-hidden shadow-sm">
            <header className="sticky top-0 z-20 min-h-[64px] shrink-0 border-b border-border/60 bg-background/85 backdrop-blur sm:min-h-[70px]">
              <div className="flex min-h-[64px] flex-wrap items-center justify-between gap-2 px-3 py-2 sm:min-h-[70px] sm:flex-nowrap sm:gap-4 sm:px-4 lg:px-5">
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                  <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Open sidebar"
                        className="size-9 rounded-md sm:size-10 lg:hidden"
                      >
                        <Menu className="size-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="flex w-[min(18rem,86vw)] flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground shadow-2xl data-[state=closed]:duration-300 data-[state=open]:duration-500 sm:max-w-72"
                    >
                      <SheetHeader className="sr-only">
                        <SheetTitle>Application sidebar</SheetTitle>
                        <SheetDescription>
                          Mobile navigation drawer for the Application Desk.
                        </SheetDescription>
                      </SheetHeader>
                      {renderSidebarContent({ drawer: true })}
                    </SheetContent>
                  </Sheet>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-pressed={sidebarCollapsed}
                    className="hidden size-10 rounded-md lg:inline-flex"
                    onClick={() => setSidebarCollapsed((currentValue) => !currentValue)}
                  >
                    <Menu className="size-5" />
                  </Button>
                  <Separator orientation="vertical" className="hidden h-5 md:block" />
                  <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 px-2">
                          <Home className="size-4" />
                          <span className="hidden truncate sm:inline">Application</span>
                          <ChevronDown className="size-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-[min(16rem,calc(100vw-4rem))] rounded-lg"
                      >
                        <DropdownMenuLabel>Switch app</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {switchableApps.map((app) => (
                          <DropdownMenuItem key={app.id} asChild>
                            <a href={app.href} className="flex cursor-pointer items-center gap-2">
                              <app.icon className="size-4 text-muted-foreground" />
                              <span className="flex-1">{app.label}</span>
                            </a>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <span className="text-sm text-muted-foreground">/</span>
                    <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
                      {workspace}
                    </h1>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="relative size-9 rounded-md px-0"
                        aria-label="Notifications"
                      >
                        <Bell className="size-4" />
                        {unreadCount > 0 ? (
                          <span className="absolute -right-1.5 -top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold leading-none text-background">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        ) : null}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-[min(24rem,calc(100vw-4rem))] rounded-lg"
                    >
                      <DropdownMenuLabel className="flex items-center justify-between gap-3">
                        <span>Notifications</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 text-xs"
                          onClick={markAllNotificationsRead}
                        >
                          Mark all read
                        </Button>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {notifications.map((notification) => {
                        const isRead = readNotificationIds.has(notification.id);

                        return (
                          <DropdownMenuItem
                            key={notification.id}
                            asChild
                            className="items-start"
                            onSelect={() => {
                              markNotificationRead(notification.id);
                            }}
                          >
                            <a
                              href={notification.href}
                              className="flex w-full cursor-pointer items-start gap-3"
                            >
                              <span
                                className={cn(
                                  "mt-1.5 size-2 rounded-full",
                                  isRead ? "bg-muted-foreground/30" : "bg-foreground",
                                )}
                              />
                              <span className="min-w-0 flex-1 space-y-1">
                                <span className="flex items-start justify-between gap-3">
                                  <span className="line-clamp-1 font-medium text-foreground">
                                    {notification.title}
                                  </span>
                                  {!isRead ? (
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                      New
                                    </span>
                                  ) : null}
                                </span>
                                <span className="line-clamp-2 block text-xs text-muted-foreground">
                                  {notification.message}
                                </span>
                                <span className="block text-[11px] text-muted-foreground">
                                  {formatDateTime(notification.createdAt)}
                                </span>
                              </span>
                            </a>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="sm"
                    className="size-9 rounded-md px-0 sm:w-auto sm:px-3"
                    asChild
                  >
                    <a href="/">
                      <Home className="size-3.5 sm:size-4" />
                      <span className="hidden sm:inline">Home</span>
                    </a>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="size-9 rounded-md px-0 data-[state=open]:bg-accent"
                        aria-label="Open theme settings"
                      >
                        {themeMode === "dark" ? (
                          <MoonStar className="size-4" />
                        ) : (
                          <SunMedium className="size-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-[min(14rem,calc(100vw-4rem))] rounded-2xl p-2"
                    >
                      <DropdownMenuLabel className="px-2 pb-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Appearance
                      </DropdownMenuLabel>
                      <DropdownMenuGroup>
                        {appearanceModes.map((mode) => (
                          <DropdownMenuItem
                            key={mode}
                            className="justify-between rounded-xl px-3 py-2"
                            onSelect={() => {
                              setAppearanceMode(mode);
                            }}
                          >
                            <span>{formatThemeLabel(mode)}</span>
                            {themeMode === mode ? <Check className="size-4" /> : null}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="px-2 pb-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Accent
                      </DropdownMenuLabel>
                      <DropdownMenuGroup>
                        {accentThemes.map((accent) => (
                          <DropdownMenuItem
                            key={accent}
                            className="justify-between rounded-xl px-3 py-2"
                            onSelect={() => {
                              setAccentMode(accent);
                            }}
                          >
                            <span>{formatThemeLabel(accent)}</span>
                            {accentTheme === accent ? <Check className="size-4" /> : null}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="sm"
                    className="size-9 rounded-md px-0 sm:w-auto sm:px-3"
                    aria-label="Logout"
                  >
                    <LogOut className="size-3.5 sm:size-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </div>
            </header>

            <div className="slim-scrollbar min-h-0 flex-1 overflow-y-auto">{children}</div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
