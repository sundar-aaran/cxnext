import type {
  CommonLocationColumnId,
  CommonLocationColumnOption,
  CommonLocationModuleDefinition,
  CommonLocationRecord,
  CommonLocationStatusFilter,
  CommonLocationUpsertInput,
} from "../domain/common-location";
import { commonLocationColumnCatalog, commonLocationDefinitions } from "../domain/common-location";

export function formatCommonLocationDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

export function createCommonLocationId(prefix: string, value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${prefix}:${slug || "new"}`;
}

export async function listCommonLocation(
  definition: CommonLocationModuleDefinition,
  options?: { readonly signal?: AbortSignal },
) {
  const records = await fetchCommonLocationRecords(definition, options);
  if (!definition.columns.includes("references")) return records;
  return enrichLocationReferences(records, definition.key, options);
}

export async function getCommonLocation(
  definition: CommonLocationModuleDefinition,
  id: string,
  options?: { readonly signal?: AbortSignal },
) {
  const response = await fetch(
    `${getApiBaseUrl()}/${definition.endpoint}/${encodeURIComponent(id)}`,
    {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: options?.signal,
    },
  );
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`${definition.title} detail request failed with status ${response.status}.`);
  return toCommonLocationRecord((await response.json()) as CommonLocationApiRecord);
}

export async function upsertCommonLocation(
  definition: CommonLocationModuleDefinition,
  input: CommonLocationUpsertInput,
  existingId?: string,
) {
  const response = await fetch(
    `${getApiBaseUrl()}/${definition.endpoint}${existingId ? `/${encodeURIComponent(existingId)}` : ""}`,
    {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      method: existingId ? "PATCH" : "POST",
    },
  );
  if (!response.ok)
    throw new Error(`${definition.title} save request failed with status ${response.status}.`);
  return toCommonLocationRecord((await response.json()) as CommonLocationApiRecord);
}

export async function softDeleteCommonLocation(
  definition: CommonLocationModuleDefinition,
  id: string,
) {
  const response = await fetch(
    `${getApiBaseUrl()}/${definition.endpoint}/${encodeURIComponent(id)}`,
    {
      cache: "no-store",
      headers: { Accept: "application/json" },
      method: "DELETE",
    },
  );
  if (!response.ok)
    throw new Error(`${definition.title} delete request failed with status ${response.status}.`);
}

export function buildCommonLocationColumnOptions(params: {
  readonly visibleColumns: Record<CommonLocationColumnId, boolean>;
  readonly enabledColumns: readonly CommonLocationColumnId[];
  readonly onToggle: (columnId: CommonLocationColumnId, checked: boolean) => void;
}): readonly CommonLocationColumnOption[] {
  const catalog = commonLocationColumnCatalog.filter((column) =>
    params.enabledColumns.includes(column.id),
  );
  return catalog.map((column) => ({
    id: column.id,
    label: column.label,
    checked: params.visibleColumns[column.id],
    disabled:
      params.visibleColumns[column.id] &&
      catalog.filter((item) => params.visibleColumns[item.id]).length === 1,
    onCheckedChange: (checked) => params.onToggle(column.id, checked),
  }));
}

export function filterCommonLocation(params: {
  readonly records: readonly CommonLocationRecord[];
  readonly searchValue: string;
  readonly statusFilter: CommonLocationStatusFilter;
}) {
  const normalizedSearch = params.searchValue.trim().toLowerCase();
  return params.records.filter((record) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [
        record.id,
        record.code,
        record.name,
        record.areaName,
        record.countryName,
        record.stateName,
        record.districtName,
        record.cityName,
        record.isActive ? "active" : "inactive",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    const matchesStatus =
      params.statusFilter === "all" ||
      (params.statusFilter === "active" && record.isActive) ||
      (params.statusFilter === "inactive" && !record.isActive);
    return matchesSearch && matchesStatus;
  });
}

interface CommonLocationApiRecord {
  readonly id: string | number;
  readonly countryId?: string | number | null;
  readonly countryName?: string | null;
  readonly stateId?: string | number | null;
  readonly stateName?: string | null;
  readonly districtId?: string | number | null;
  readonly districtName?: string | null;
  readonly cityId?: string | number | null;
  readonly cityName?: string | null;
  readonly code: string;
  readonly name?: string | null;
  readonly phoneCode?: string | null;
  readonly areaName?: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

async function fetchCommonLocationRecords(
  definition: CommonLocationModuleDefinition,
  options?: { readonly signal?: AbortSignal },
) {
  const response = await fetch(`${getApiBaseUrl()}/${definition.endpoint}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });
  if (!response.ok)
    throw new Error(`${definition.title} list request failed with status ${response.status}.`);
  return ((await response.json()) as CommonLocationApiRecord[]).map(toCommonLocationRecord);
}

async function enrichLocationReferences(
  records: readonly CommonLocationRecord[],
  moduleKey: CommonLocationModuleDefinition["key"],
  options?: { readonly signal?: AbortSignal },
) {
  const lookups = await buildReferenceLookups(moduleKey, options);

  return records.map((record) => ({
    ...record,
    countryName: record.countryId ? (lookups.countries.get(record.countryId) ?? null) : null,
    stateName: record.stateId ? (lookups.states.get(record.stateId) ?? null) : null,
    districtName: record.districtId ? (lookups.districts.get(record.districtId) ?? null) : null,
    cityName: record.cityId ? (lookups.cities.get(record.cityId) ?? null) : null,
  }));
}

async function buildReferenceLookups(
  moduleKey: CommonLocationModuleDefinition["key"],
  options?: { readonly signal?: AbortSignal },
) {
  const lookupDefinitions = getReferenceLookupDefinitions(moduleKey);
  const entries = await Promise.all(
    lookupDefinitions.map(async (definition) => [
      definition.key,
      toNameLookup(await fetchCommonLocationRecords(definition, options)),
    ]),
  );

  return {
    countries: new Map<string, string>(),
    states: new Map<string, string>(),
    districts: new Map<string, string>(),
    cities: new Map<string, string>(),
    ...Object.fromEntries(entries),
  } as Record<"countries" | "states" | "districts" | "cities", Map<string, string>>;
}

function getReferenceLookupDefinitions(moduleKey: CommonLocationModuleDefinition["key"]) {
  if (moduleKey === "states") return [commonLocationDefinitions.countries];
  if (moduleKey === "districts") return [commonLocationDefinitions.states];
  if (moduleKey === "cities")
    return [commonLocationDefinitions.states, commonLocationDefinitions.districts];
  if (moduleKey === "pincodes")
    return [
      commonLocationDefinitions.countries,
      commonLocationDefinitions.states,
      commonLocationDefinitions.districts,
      commonLocationDefinitions.cities,
    ];
  return [];
}

function toNameLookup(records: readonly CommonLocationRecord[]) {
  return new Map(records.map((record) => [record.id, record.name ?? record.areaName ?? record.code]));
}

function nullableId(value: string | number | null | undefined) {
  return value === null || value === undefined ? null : String(value);
}

function toCommonLocationRecord(record: CommonLocationApiRecord): CommonLocationRecord {
  return {
    id: String(record.id),
    countryId: nullableId(record.countryId),
    countryName: record.countryName ?? null,
    stateId: nullableId(record.stateId),
    stateName: record.stateName ?? null,
    districtId: nullableId(record.districtId),
    districtName: record.districtName ?? null,
    cityId: nullableId(record.cityId),
    cityName: record.cityName ?? null,
    code: record.code,
    name: record.name ?? null,
    phoneCode: record.phoneCode ?? null,
    areaName: record.areaName ?? null,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
  };
}
