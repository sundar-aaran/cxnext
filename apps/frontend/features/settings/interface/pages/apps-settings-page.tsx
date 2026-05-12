"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Boxes,
  Building2,
  Check,
  ClipboardCheck,
  CreditCard,
  Database,
  FileText,
  Globe,
  GraduationCap,
  Headphones,
  MessageSquare,
  Package,
  PenLine,
  ReceiptText,
  Settings2,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Wrench,
} from "lucide-react";
import { Badge, Card, CardContent, CommonListPageFrame, cn } from "@cxnext/ui";
import { readStoredApplicationContext } from "../../../auth/infrastructure/session-storage";

const storageKey = "cxnext.settings.apps.enabled";
const companyStorageKeyPrefix = `${storageKey}:company:`;

type AppModule = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: typeof Globe;
  readonly defaultEnabled?: boolean;
};

type AppModuleGroup = {
  readonly id: string;
  readonly title: string;
  readonly modules: readonly AppModule[];
};

const appModuleGroups: readonly AppModuleGroup[] = [
  {
    id: "website",
    title: "Website",
    modules: [
      {
        id: "website",
        title: "Website",
        description: "Enterprise website builder",
        icon: Globe,
        defaultEnabled: true,
      },
      {
        id: "ecommerce",
        title: "eCommerce",
        description: "Sell your products online",
        icon: ShoppingBag,
        defaultEnabled: true,
      },
      {
        id: "blog",
        title: "Blog",
        description: "Publish posts, announcements, news",
        icon: MessageSquare,
      },
      {
        id: "forum",
        title: "Forum",
        description: "Manage a forum with FAQ and Q&A",
        icon: BookOpen,
      },
      {
        id: "elearning",
        title: "eLearning",
        description: "Manage and publish courses",
        icon: GraduationCap,
      },
      {
        id: "live-chat",
        title: "Live Chat",
        description: "Chat with your website visitors",
        icon: Headphones,
      },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    modules: [
      {
        id: "crm",
        title: "CRM",
        description: "Track leads and close opportunities",
        icon: BadgeCheck,
        defaultEnabled: true,
      },
      {
        id: "sales",
        title: "Sales",
        description: "From quotations to invoices",
        icon: ReceiptText,
        defaultEnabled: true,
      },
      {
        id: "point-of-sale",
        title: "Point of Sale",
        description: "PoS interface for shops and restaurants",
        icon: Store,
      },
      {
        id: "subscriptions",
        title: "Subscriptions",
        description: "Recurring invoices and renewals",
        icon: CreditCard,
      },
      {
        id: "rental",
        title: "Rental",
        description: "Manage contracts, deliveries and returns",
        icon: Wrench,
      },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    modules: [
      {
        id: "accounting",
        title: "Accounting",
        description: "Manage financial and analytic accounting",
        icon: CreditCard,
        defaultEnabled: true,
      },
      {
        id: "invoicing",
        title: "Invoicing",
        description: "Invoices and payments",
        icon: ReceiptText,
        defaultEnabled: true,
      },
      {
        id: "expenses",
        title: "Expenses",
        description: "Manage employee expenses",
        icon: ShoppingCart,
      },
      {
        id: "documents",
        title: "Documents",
        description: "Document management",
        icon: FileText,
      },
      {
        id: "spreadsheets",
        title: "Spreadsheets",
        description: "Documents spreadsheet",
        icon: Database,
      },
      {
        id: "sign",
        title: "Sign",
        description: "Sign documents online",
        icon: PenLine,
      },
    ],
  },
  {
    id: "inventory",
    title: "Inventory & Manufacturing",
    modules: [
      {
        id: "inventory",
        title: "Inventory",
        description: "Manage your stock and logistics activities",
        icon: Package,
        defaultEnabled: true,
      },
      {
        id: "manufacturing",
        title: "Manufacturing",
        description: "Manufacturing orders and BOMs",
        icon: Building2,
      },
      {
        id: "plm",
        title: "PLM",
        description: "Product lifecycle management",
        icon: Boxes,
      },
      {
        id: "purchase",
        title: "Purchase",
        description: "Purchase orders, tenders and agreements",
        icon: ShoppingBag,
        defaultEnabled: true,
      },
      {
        id: "maintenance",
        title: "Maintenance",
        description: "Track equipment and manage requests",
        icon: Settings2,
      },
      {
        id: "quality",
        title: "Quality",
        description: "Control the quality of your products",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    modules: [
      {
        id: "billing",
        title: "Billing",
        description: "Sales, purchases, receipts and payments",
        icon: ReceiptText,
        defaultEnabled: true,
      },
      {
        id: "stock",
        title: "Stock",
        description: "Stock queues, movement and availability",
        icon: Truck,
        defaultEnabled: true,
      },
      {
        id: "task",
        title: "Task",
        description: "Work queues and follow-up actions",
        icon: ClipboardCheck,
        defaultEnabled: true,
      },
      {
        id: "tally",
        title: "Tally",
        description: "Accounting handoff and ledger workflow",
        icon: Database,
        defaultEnabled: true,
      },
    ],
  },
];

const defaultEnabledApps = Object.fromEntries(
  appModuleGroups.flatMap((group) =>
    group.modules.map((module) => [module.id, Boolean(module.defaultEnabled)]),
  ),
);

export function AppsSettingsPage() {
  const [enabledApps, setEnabledApps] = useState<Record<string, boolean>>(defaultEnabledApps);
  const [activeCompany, setActiveCompany] = useState<{
    readonly id: string | null;
    readonly name: string;
  }>({ id: null, name: "Active company" });

  useEffect(() => {
    const context = readStoredApplicationContext();
    const companyId = context?.company.id ?? null;
    setActiveCompany({
      id: companyId,
      name: context?.company.name ?? "Active company",
    });

    try {
      const stored = companyId ? window.localStorage.getItem(companyStorageKey(companyId)) : null;
      if (!stored) return;
      setEnabledApps({ ...defaultEnabledApps, ...JSON.parse(stored) });
    } catch {
      setEnabledApps(defaultEnabledApps);
    }
  }, []);

  useEffect(() => {
    if (!activeCompany.id) return;
    window.localStorage.setItem(companyStorageKey(activeCompany.id), JSON.stringify(enabledApps));
  }, [activeCompany.id, enabledApps]);

  const enabledCount = useMemo(
    () => Object.values(enabledApps).filter(Boolean).length,
    [enabledApps],
  );
  const totalCount = appModuleGroups.reduce((total, group) => total + group.modules.length, 0);

  function toggleModule(moduleId: string) {
    setEnabledApps((current) => ({ ...current, [moduleId]: !current[moduleId] }));
  }

  return (
    <CommonListPageFrame
      description={`Enable the application modules available for ${activeCompany.name}.`}
      technicalName="page.settings.apps"
      title="Apps"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/70 bg-card px-4 py-3 shadow-sm">
        <div>
          <p className="text-sm font-medium text-foreground">One need, one app.</p>
          <p className="text-sm text-muted-foreground">
            {enabledCount} of {totalCount} modules enabled
          </p>
        </div>
        <Badge
          variant="outline"
          className="rounded-md border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          Enabled modules
        </Badge>
      </div>

      <div className="grid gap-8">
        {appModuleGroups.map((group) => (
          <section key={group.id} className="grid gap-4">
            <h2 className="text-xl font-semibold text-foreground">{group.title}</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.modules.map((module) => (
                <AppModuleCard
                  key={module.id}
                  module={module}
                  enabled={Boolean(enabledApps[module.id])}
                  onToggle={() => toggleModule(module.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </CommonListPageFrame>
  );
}

function companyStorageKey(companyId: string) {
  return `${companyStorageKeyPrefix}${companyId}`;
}

function AppModuleCard({
  enabled,
  module,
  onToggle,
}: {
  readonly enabled: boolean;
  readonly module: AppModule;
  readonly onToggle: () => void;
}) {
  const Icon = module.icon;

  return (
    <Card
      role="checkbox"
      aria-checked={enabled}
      tabIndex={0}
      className={cn(
        "rounded-md border-border/70 bg-card shadow-sm transition-colors hover:border-foreground/25",
        enabled && "border-emerald-300 bg-emerald-50/55",
      )}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onToggle();
      }}
    >
      <CardContent className="grid min-h-24 grid-cols-[3rem_1fr_auto] items-center gap-3 p-3">
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-md bg-muted text-foreground",
            enabled && "bg-emerald-100 text-emerald-700",
          )}
        >
          <Icon className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">{module.title}</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            {module.description}
          </span>
        </span>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground",
            enabled && "border-emerald-300 bg-emerald-600 text-white",
          )}
          aria-hidden="true"
        >
          {enabled ? <Check className="size-4" /> : null}
        </span>
      </CardContent>
    </Card>
  );
}
