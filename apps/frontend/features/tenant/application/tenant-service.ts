import type {
  TenantColumnId,
  TenantColumnOption,
  TenantRecord,
  TenantUpsertInput,
} from "../domain/tenant";
import { tenantColumnCatalog } from "../domain/tenant";

export function createTenantSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatTenantDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export async function listTenants(options?: { readonly signal?: AbortSignal }) {
  const response = await fetch(`${getApiBaseUrl()}/tenants`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`Tenant list request failed with status ${response.status}.`);
  }

  const records = (await response.json()) as TenantApiRecord[];
  return records.map(toTenantRecord);
}

export async function getTenant(tenantId: number, options?: { readonly signal?: AbortSignal }) {
  const response = await fetch(`${getApiBaseUrl()}/tenants/${tenantId}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
    signal: options?.signal,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Tenant detail request failed with status ${response.status}.`);
  }

  return toTenantRecord((await response.json()) as TenantApiRecord);
}

export async function upsertTenant(input: TenantUpsertInput, tenantId?: number) {
  const response = await fetch(`${getApiBaseUrl()}/tenants${tenantId ? `/${tenantId}` : ""}`, {
    body: JSON.stringify(input),
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: tenantId ? "PATCH" : "POST",
  });

  if (!response.ok) {
    throw new Error(`Tenant save request failed with status ${response.status}.`);
  }

  return toTenantRecord((await response.json()) as TenantApiRecord);
}

export async function softDeleteTenant(tenantId: number) {
  const response = await fetch(`${getApiBaseUrl()}/tenants/${tenantId}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Tenant delete request failed with status ${response.status}.`);
  }
}

export function buildTenantColumnOptions(params: {
  readonly visibleColumns: Record<TenantColumnId, boolean>;
  readonly onToggle: (columnId: TenantColumnId, checked: boolean) => void;
}): readonly TenantColumnOption[] {
  return tenantColumnCatalog.map((column) => ({
    id: column.id,
    label: column.label,
    checked: params.visibleColumns[column.id],
    disabled:
      params.visibleColumns[column.id] &&
      tenantColumnCatalog.filter((item) => params.visibleColumns[item.id]).length === 1,
    onCheckedChange: (checked) => params.onToggle(column.id, checked),
  }));
}

export function filterTenants(params: {
  readonly tenants: readonly TenantRecord[];
  readonly searchValue: string;
  readonly statusFilter: "all" | "active" | "inactive";
}) {
  const normalizedSearch = params.searchValue.trim().toLowerCase();

  return params.tenants.filter((tenant) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [tenant.name, tenant.slug, tenant.isActive ? "active" : "inactive", tenant.id]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    const matchesStatus =
      params.statusFilter === "all" ||
      (params.statusFilter === "active" && tenant.isActive) ||
      (params.statusFilter === "inactive" && !tenant.isActive);

    return matchesSearch && matchesStatus;
  });
}

interface TenantApiRecord {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

function toTenantRecord(record: TenantApiRecord): TenantRecord {
  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
  };
}
