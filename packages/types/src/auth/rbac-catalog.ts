export const authPolicyActions = ["read", "create", "update", "delete", "manage"] as const;

export type AuthPolicyAction = (typeof authPolicyActions)[number];

export type AuthPolicyModuleKey =
  | "auth"
  | "tenant"
  | "industry"
  | "company"
  | "contact"
  | "product"
  | "sales"
  | "purchase"
  | "payment"
  | "receipt"
  | "common";

export interface AuthPolicyModuleDefinition {
  readonly key: AuthPolicyModuleKey;
  readonly name: string;
  readonly boundedContext: string;
  readonly actions: readonly AuthPolicyAction[];
  readonly description: string;
}

export interface AuthRoleBlueprint {
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly permissionKeys: readonly string[];
  readonly isSystem: boolean;
}

export const authPolicyModules = {
  auth: {
    key: "auth",
    name: "Auth",
    boundedContext: "security",
    actions: ["read", "manage"],
    description: "Identity, session, user administration, and role assignment.",
  },
  tenant: {
    key: "tenant",
    name: "Tenant",
    boundedContext: "organisation",
    actions: ["read", "create", "update", "delete", "manage"],
    description: "Tenant lifecycle, workspace provisioning, and tenant administration.",
  },
  industry: {
    key: "industry",
    name: "Industry",
    boundedContext: "organisation",
    actions: ["read", "create", "update", "delete"],
    description: "Industry records used for organisation classification.",
  },
  company: {
    key: "company",
    name: "Company",
    boundedContext: "organisation",
    actions: ["read", "create", "update", "delete"],
    description: "Company master records and organisation configuration.",
  },
  contact: {
    key: "contact",
    name: "Contact",
    boundedContext: "crm",
    actions: ["read", "create", "update", "delete"],
    description: "Contacts, parties, customer profiles, and supplier records.",
  },
  product: {
    key: "product",
    name: "Product",
    boundedContext: "catalog",
    actions: ["read", "create", "update", "delete"],
    description: "Product catalog, pricing, variants, and supporting metadata.",
  },
  sales: {
    key: "sales",
    name: "Sales",
    boundedContext: "entries",
    actions: ["read", "create", "update", "delete"],
    description: "Sales billing entries and downstream commercial documents.",
  },
  purchase: {
    key: "purchase",
    name: "Purchase",
    boundedContext: "entries",
    actions: ["read", "create", "update", "delete"],
    description: "Purchase billing entries and procurement documents.",
  },
  payment: {
    key: "payment",
    name: "Payment",
    boundedContext: "entries",
    actions: ["read", "create", "update", "delete"],
    description: "Outgoing payment entries and money movement records.",
  },
  receipt: {
    key: "receipt",
    name: "Receipt",
    boundedContext: "entries",
    actions: ["read", "create", "update", "delete"],
    description: "Incoming receipt entries and cash collection records.",
  },
  common: {
    key: "common",
    name: "Common",
    boundedContext: "shared",
    actions: ["read", "create", "update", "delete"],
    description: "Shared common masters and location records used across modules.",
  },
} as const satisfies Record<AuthPolicyModuleKey, AuthPolicyModuleDefinition>;

export const authPolicyModuleList = Object.values(authPolicyModules);

export const authPermissionKeys = Object.fromEntries(
  authPolicyModuleList.map((moduleDefinition) => [
    moduleDefinition.key,
    Object.fromEntries(
      moduleDefinition.actions.map((action) => [
        action,
        buildAuthPermissionKey(moduleDefinition.key, action),
      ]),
    ),
  ]),
) as {
  readonly [TModuleKey in AuthPolicyModuleKey]: {
    readonly [TAction in ExtractSupportedAction<TModuleKey>]: string;
  };
};

export const authRoleBlueprints = [
  {
    key: "super_admin",
    name: "Super Admin",
    description: "Full access across every bounded context, tenant, and shared platform surface.",
    permissionKeys: authPolicyModuleList.flatMap((moduleDefinition) =>
      moduleDefinition.actions.map((action) =>
        buildAuthPermissionKey(moduleDefinition.key, action),
      ),
    ),
    isSystem: true,
  },
  {
    key: "admin",
    name: "Admin",
    description: "Tenant administration, user management, and full business module access.",
    permissionKeys: [
      ...permissionsForModules(["auth"], ["read", "manage"]),
      ...permissionsForModules(["tenant"], ["read"]),
      ...permissionsForModules(
        ["industry", "company", "contact", "product", "sales", "purchase", "payment", "receipt", "common"],
        ["read", "create", "update", "delete"],
      ),
    ],
    isSystem: true,
  },
  {
    key: "manager",
    name: "Manager",
    description: "Operational ownership across business modules without auth administration.",
    permissionKeys: permissionsForModules(
      ["industry", "company", "contact", "product", "sales", "purchase", "payment", "receipt", "common"],
      ["read", "create", "update", "delete"],
    ),
    isSystem: true,
  },
  {
    key: "operator",
    name: "Operator",
    description: "Day-to-day data entry with update access across enabled business modules.",
    permissionKeys: permissionsForModules(
      ["industry", "company", "contact", "product", "sales", "purchase", "payment", "receipt", "common"],
      ["read", "create", "update"],
    ),
    isSystem: true,
  },
  {
    key: "viewer",
    name: "Viewer",
    description: "Read-only visibility across the workspace.",
    permissionKeys: permissionsForModules(
      ["auth", "tenant", "industry", "company", "contact", "product", "sales", "purchase", "payment", "receipt", "common"],
      ["read"],
    ),
    isSystem: true,
  },
  {
    key: "web_client",
    name: "Web Client",
    description: "External client access for viewing catalog, contact, and sales-facing records.",
    permissionKeys: permissionsForModules(["contact", "product", "sales"], ["read"]),
    isSystem: true,
  },
  {
    key: "premium_client",
    name: "Premium Client",
    description: "External client access with limited create and update workflows.",
    permissionKeys: permissionsForModules(["contact", "product", "sales"], ["read", "create", "update"]),
    isSystem: true,
  },
] as const satisfies readonly AuthRoleBlueprint[];

export function buildAuthPermissionKey(moduleKey: AuthPolicyModuleKey, action: AuthPolicyAction) {
  return `${moduleKey}.${action}`;
}

export function permissionsForModules(
  moduleKeys: readonly AuthPolicyModuleKey[],
  actions: readonly AuthPolicyAction[],
) {
  return moduleKeys.flatMap((moduleKey) =>
    actions
      .filter((action) =>
        (authPolicyModules[moduleKey].actions as readonly AuthPolicyAction[]).some(
          (supportedAction) => supportedAction === action,
        ),
      )
      .map((action) => buildAuthPermissionKey(moduleKey, action)),
  );
}

export function createScopedRoleBlueprints(moduleKey: Exclude<AuthPolicyModuleKey, "auth" | "tenant">) {
  const moduleDefinition = authPolicyModules[moduleKey];
  const moduleLabel = moduleDefinition.name;

  return [
    {
      key: `${moduleKey}_manager`,
      name: `${moduleLabel} manager`,
      description: `Full ${moduleLabel.toLowerCase()} access for create, update, delete, and read workflows.`,
      permissionKeys: permissionsForModules([moduleKey], ["read", "create", "update", "delete"]),
      isSystem: true,
    },
    {
      key: `${moduleKey}_editor`,
      name: `${moduleLabel} editor`,
      description: `Operational ${moduleLabel.toLowerCase()} access for create and update workflows.`,
      permissionKeys: permissionsForModules([moduleKey], ["read", "create", "update"]),
      isSystem: true,
    },
    {
      key: `${moduleKey}_viewer`,
      name: `${moduleLabel} viewer`,
      description: `Read-only access for ${moduleLabel.toLowerCase()} records and workflows.`,
      permissionKeys: permissionsForModules([moduleKey], ["read"]),
      isSystem: true,
    },
  ] as const satisfies readonly AuthRoleBlueprint[];
}

type ExtractSupportedAction<TModuleKey extends AuthPolicyModuleKey> =
  (typeof authPolicyModules)[TModuleKey]["actions"][number];
