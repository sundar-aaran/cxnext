import type { SalesLookupOption } from "../domain/sales";
import { getRequiredPublicApiUrl } from "@/lib/runtime-env";
import { authFetch } from "../../auth/infrastructure/auth-api";

interface ContactLookupRecord {
  readonly id: string | number;
  readonly code?: string | null;
  readonly name?: string | null;
  readonly ledgerName?: string | null;
}

interface ProductLookupRecord {
  readonly id: string | number;
  readonly code?: string | null;
  readonly name?: string | null;
  readonly sku?: string | null;
}

export async function listSalesContactLookups(options?: { readonly signal?: AbortSignal }) {
  const response = await authFetch(`${apiBaseUrl()}/contacts`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`Contact lookup failed with status ${response.status}.`);
  }

  return ((await response.json()) as ContactLookupRecord[]).map((record) => ({
    id: String(record.id),
    label: record.name?.trim() || `Contact ${record.id}`,
    secondaryLabel: [record.code, record.ledgerName].filter(Boolean).join(" / ") || null,
  })) satisfies SalesLookupOption[];
}

export async function listSalesProductLookups(options?: { readonly signal?: AbortSignal }) {
  const response = await authFetch(`${apiBaseUrl()}/products`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`Product lookup failed with status ${response.status}.`);
  }

  return ((await response.json()) as ProductLookupRecord[]).map((record) => ({
    id: String(record.id),
    label: record.name?.trim() || `Product ${record.id}`,
    secondaryLabel: [record.code, record.sku].filter(Boolean).join(" / ") || null,
  })) satisfies SalesLookupOption[];
}

function apiBaseUrl() {
  return getRequiredPublicApiUrl();
}
