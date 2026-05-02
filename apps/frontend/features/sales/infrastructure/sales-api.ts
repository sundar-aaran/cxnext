import type { SalesInput, SalesRecord } from "../domain/sales";
import { getRequiredPublicApiUrl } from "@/lib/runtime-env";
import { authFetch } from "../../auth/infrastructure/auth-api";

export async function listSales(options?: { readonly signal?: AbortSignal }) {
  const response = await authFetch(`${apiBaseUrl()}/entries/sales`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });
  if (!response.ok) throw new Error(`Sales list failed with status ${response.status}.`);
  return ((await response.json()) as Array<Omit<SalesRecord, "id"> & { id: string }>).map(toRecord);
}

export async function getSales(id: number, options?: { readonly signal?: AbortSignal }) {
  const response = await authFetch(`${apiBaseUrl()}/entries/sales/${id}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Sales detail failed with status ${response.status}.`);
  return toRecord((await response.json()) as Omit<SalesRecord, "id"> & { id: string });
}

export async function upsertSales(input: SalesInput, id?: number) {
  const response = await authFetch(`${apiBaseUrl()}/entries/sales${id ? `/${id}` : ""}`, {
    body: JSON.stringify(input),
    cache: "no-store",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    method: id ? "PATCH" : "POST",
  });
  if (!response.ok) throw new Error(`Sales save failed with status ${response.status}.`);
  return toRecord((await response.json()) as Omit<SalesRecord, "id"> & { id: string });
}

export async function deleteSales(id: number) {
  const response = await authFetch(`${apiBaseUrl()}/entries/sales/${id}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Sales delete failed with status ${response.status}.`);
}

function apiBaseUrl() {
  return getRequiredPublicApiUrl();
}

function toRecord(record: Omit<SalesRecord, "id"> & { id: string }): SalesRecord {
  return { ...record, id: Number(record.id) };
}
