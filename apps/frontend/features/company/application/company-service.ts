import type {
  CompanyColumnId,
  CompanyColumnOption,
  CompanyRecord,
  CompanyStatusFilter,
  CompanyUpsertInput,
} from "../domain/company";
import { companyColumnCatalog } from "../domain/company";

export function formatCompanyDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export async function listCompanies(options?: { readonly signal?: AbortSignal }) {
  const response = await fetch(`${getApiBaseUrl()}/companies`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`Company list request failed with status ${response.status}.`);
  }

  return ((await response.json()) as CompanyApiRecord[]).map(toCompanyRecord);
}

export async function getCompany(companyId: number, options?: { readonly signal?: AbortSignal }) {
  const response = await fetch(`${getApiBaseUrl()}/companies/${companyId}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Company detail request failed with status ${response.status}.`);
  }

  return toCompanyRecord((await response.json()) as CompanyApiRecord);
}

export async function upsertCompany(input: CompanyUpsertInput, companyId?: number) {
  const response = await fetch(`${getApiBaseUrl()}/companies${companyId ? `/${companyId}` : ""}`, {
    body: JSON.stringify(input),
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: companyId ? "PATCH" : "POST",
  });

  if (!response.ok) {
    throw new Error(`Company save request failed with status ${response.status}.`);
  }

  return toCompanyRecord((await response.json()) as CompanyApiRecord);
}

export async function softDeleteCompany(companyId: number) {
  const response = await fetch(`${getApiBaseUrl()}/companies/${companyId}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Company delete request failed with status ${response.status}.`);
  }
}

export function buildCompanyColumnOptions(params: {
  readonly visibleColumns: Record<CompanyColumnId, boolean>;
  readonly onToggle: (columnId: CompanyColumnId, checked: boolean) => void;
}): readonly CompanyColumnOption[] {
  return companyColumnCatalog.map((column) => ({
    id: column.id,
    label: column.label,
    checked: params.visibleColumns[column.id],
    disabled:
      params.visibleColumns[column.id] &&
      companyColumnCatalog.filter((item) => params.visibleColumns[item.id]).length === 1,
    onCheckedChange: (checked) => params.onToggle(column.id, checked),
  }));
}

export function filterCompanies(params: {
  readonly companies: readonly CompanyRecord[];
  readonly searchValue: string;
  readonly statusFilter: CompanyStatusFilter;
}) {
  const normalizedSearch = params.searchValue.trim().toLowerCase();

  return params.companies.filter((company) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [
        company.name,
        company.tenantName,
        company.industryName,
        company.isActive ? "active" : "inactive",
        company.id,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    const matchesStatus =
      params.statusFilter === "all" ||
      (params.statusFilter === "active" && company.isActive) ||
      (params.statusFilter === "inactive" && !company.isActive);

    return matchesSearch && matchesStatus;
  });
}

type CompanyApiRecord = Omit<CompanyRecord, "id" | "tenantId" | "industryId"> & {
  readonly id: string;
  readonly tenantId: string;
  readonly industryId: string;
};

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

function toCompanyRecord(record: CompanyApiRecord): CompanyRecord {
  return {
    ...record,
    id: Number(record.id),
    tenantId: Number(record.tenantId),
    industryId: Number(record.industryId),
  };
}
