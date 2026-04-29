import type {
  IndustryColumnId,
  IndustryColumnOption,
  IndustryRecord,
  IndustryStatusFilter,
  IndustryUpsertInput,
} from "../domain/industry";
import { industryColumnCatalog } from "../domain/industry";

export function formatIndustryDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export async function listIndustries(options?: { readonly signal?: AbortSignal }) {
  const response = await fetch(`${getApiBaseUrl()}/industries`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`Industry list request failed with status ${response.status}.`);
  }

  const records = (await response.json()) as IndustryApiRecord[];
  return records.map(toIndustryRecord);
}

export async function getIndustry(industryId: number, options?: { readonly signal?: AbortSignal }) {
  const response = await fetch(`${getApiBaseUrl()}/industries/${industryId}`, {
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
    throw new Error(`Industry detail request failed with status ${response.status}.`);
  }

  return toIndustryRecord((await response.json()) as IndustryApiRecord);
}

export async function upsertIndustry(input: IndustryUpsertInput, industryId?: number) {
  const response = await fetch(
    `${getApiBaseUrl()}/industries${industryId ? `/${industryId}` : ""}`,
    {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: industryId ? "PATCH" : "POST",
    },
  );

  if (!response.ok) {
    throw new Error(`Industry save request failed with status ${response.status}.`);
  }

  return toIndustryRecord((await response.json()) as IndustryApiRecord);
}

export async function softDeleteIndustry(industryId: number) {
  const response = await fetch(`${getApiBaseUrl()}/industries/${industryId}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Industry delete request failed with status ${response.status}.`);
  }
}

export function buildIndustryColumnOptions(params: {
  readonly visibleColumns: Record<IndustryColumnId, boolean>;
  readonly onToggle: (columnId: IndustryColumnId, checked: boolean) => void;
}): readonly IndustryColumnOption[] {
  return industryColumnCatalog.map((column) => ({
    id: column.id,
    label: column.label,
    checked: params.visibleColumns[column.id],
    disabled:
      params.visibleColumns[column.id] &&
      industryColumnCatalog.filter((item) => params.visibleColumns[item.id]).length === 1,
    onCheckedChange: (checked) => params.onToggle(column.id, checked),
  }));
}

export function filterIndustries(params: {
  readonly industries: readonly IndustryRecord[];
  readonly searchValue: string;
  readonly statusFilter: IndustryStatusFilter;
}) {
  const normalizedSearch = params.searchValue.trim().toLowerCase();

  return params.industries.filter((industry) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [industry.name, industry.isActive ? "active" : "inactive", industry.id]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    const matchesStatus =
      params.statusFilter === "all" ||
      (params.statusFilter === "active" && industry.isActive) ||
      (params.statusFilter === "inactive" && !industry.isActive);

    return matchesSearch && matchesStatus;
  });
}

interface IndustryApiRecord {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

function toIndustryRecord(record: IndustryApiRecord): IndustryRecord {
  return {
    id: Number(record.id),
    name: record.name,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
  };
}
