import type { TenantRecord, TenantUpsertInput } from "../domain/tenant";

const STORAGE_KEY = "cxnext.tenants";

const seedTenants: readonly TenantRecord[] = [
  {
    id: 1,
    name: "Codexsun Commerce",
    slug: "codexsun-commerce",
    isActive: true,
    createdAt: "2026-04-28T09:00:00.000Z",
    updatedAt: "2026-04-28T09:00:00.000Z",
    deletedAt: null,
  },
  {
    id: 2,
    name: "Acme Enterprise",
    slug: "acme-enterprise",
    isActive: true,
    createdAt: "2026-04-28T10:30:00.000Z",
    updatedAt: "2026-04-28T10:30:00.000Z",
    deletedAt: null,
  },
  {
    id: 3,
    name: "Northwind Trial",
    slug: "northwind-trial",
    isActive: false,
    createdAt: "2026-04-28T11:45:00.000Z",
    updatedAt: "2026-04-29T06:15:00.000Z",
    deletedAt: null,
  },
] as const;

export function listTenantRecords({
  includeDeleted = false,
}: { readonly includeDeleted?: boolean } = {}) {
  return readTenants().filter((tenant) => includeDeleted || !tenant.deletedAt);
}

export function listSeedTenantRecords({
  includeDeleted = false,
}: { readonly includeDeleted?: boolean } = {}) {
  return [...seedTenants].filter((tenant) => includeDeleted || !tenant.deletedAt);
}

export function getTenantRecord(tenantId: number, options?: { readonly source?: "seed" }) {
  const tenants = options?.source === "seed" ? listSeedTenantRecords() : readTenants();

  return tenants.find((tenant) => tenant.id === tenantId && !tenant.deletedAt) ?? null;
}

export function saveTenantRecord(input: TenantUpsertInput, tenantId?: number) {
  const tenants = readTenants();
  const now = new Date().toISOString();

  if (tenantId) {
    const existingTenant = tenants.find((tenant) => tenant.id === tenantId);

    if (!existingTenant) {
      throw new Error("Tenant record was not found.");
    }

    const updatedTenant: TenantRecord = {
      ...existingTenant,
      name: input.name.trim(),
      slug: input.slug.trim(),
      isActive: input.isActive,
      updatedAt: now,
    };

    writeTenants(tenants.map((tenant) => (tenant.id === tenantId ? updatedTenant : tenant)));
    return updatedTenant;
  }

  const nextTenant: TenantRecord = {
    id: getNextTenantId(tenants),
    name: input.name.trim(),
    slug: input.slug.trim(),
    isActive: input.isActive,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  writeTenants([...tenants, nextTenant]);
  return nextTenant;
}

export function softDeleteTenantRecord(tenantId: number) {
  const tenants = readTenants();
  const now = new Date().toISOString();

  writeTenants(
    tenants.map((tenant) =>
      tenant.id === tenantId ? { ...tenant, deletedAt: now, updatedAt: now } : tenant,
    ),
  );
}

function getNextTenantId(tenants: readonly TenantRecord[]) {
  return tenants.reduce((highestId, tenant) => Math.max(highestId, tenant.id), 0) + 1;
}

function readTenants(): TenantRecord[] {
  if (typeof window === "undefined") {
    return [...seedTenants];
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    writeTenants([...seedTenants]);
    return [...seedTenants];
  }

  try {
    const parsedValue = JSON.parse(storedValue) as TenantRecord[];
    return Array.isArray(parsedValue) ? parsedValue : [...seedTenants];
  } catch {
    return [...seedTenants];
  }
}

function writeTenants(tenants: readonly TenantRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
}
