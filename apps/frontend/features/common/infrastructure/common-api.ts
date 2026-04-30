import type { CommonModuleDefinition, CommonRecord } from "../domain/common-master";

const commonEndpointByKey: Record<string, string> = {
  countries: "countries",
  states: "states",
  districts: "districts",
  cities: "cities",
  pincodes: "pincodes",
  contactGroups: "contact-groups",
  contactTypes: "contact-types",
  addressTypes: "address-types",
  bankNames: "bank-names",
  productGroups: "product-groups",
  productCategories: "product-categories",
  productTypes: "product-types",
  brands: "brands",
  colours: "colours",
  sizes: "sizes",
  styles: "styles",
  units: "units",
  hsnCodes: "hsn-codes",
  taxes: "taxes",
  warehouses: "warehouses",
  transports: "transports",
  destinations: "destinations",
  orderTypes: "order-types",
  stockRejectionTypes: "stock-rejection-types",
  currencies: "currencies",
  paymentTerms: "payment-terms",
};

export async function listCommonModules(options?: { readonly signal?: AbortSignal }) {
  const response = await fetch(`${getApiBaseUrl()}/common/modules`, {
    cache: "no-store",
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`Common metadata request failed with status ${response.status}.`);
  }

  return (await response.json()) as CommonModuleDefinition[];
}

export async function listCommonRecords(
  moduleKey: string,
  options?: { readonly signal?: AbortSignal },
) {
  const response = await fetch(`${getApiBaseUrl()}/common/${getCommonEndpoint(moduleKey)}`, {
    cache: "no-store",
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`Common list request failed with status ${response.status}.`);
  }

  return (await response.json()) as CommonRecord[];
}

export async function createCommonRecord(moduleKey: string, payload: Record<string, unknown>) {
  const response = await fetch(
    `${getApiBaseUrl()}/common/${getCommonEndpoint(moduleKey)}`,
    request("POST", payload),
  );

  if (!response.ok) {
    throw new Error(`Common create request failed with status ${response.status}.`);
  }

  return (await response.json()) as CommonRecord;
}

export async function updateCommonRecord(
  moduleKey: string,
  id: number,
  payload: Record<string, unknown>,
) {
  const response = await fetch(
    `${getApiBaseUrl()}/common/${getCommonEndpoint(moduleKey)}/${encodeURIComponent(String(id))}`,
    request("PATCH", payload),
  );

  if (!response.ok) {
    throw new Error(`Common update request failed with status ${response.status}.`);
  }

  return (await response.json()) as CommonRecord;
}

export async function dropCommonRecord(moduleKey: string, id: number) {
  const response = await fetch(
    `${getApiBaseUrl()}/common/${getCommonEndpoint(moduleKey)}/${encodeURIComponent(String(id))}`,
    { cache: "no-store", method: "DELETE" },
  );

  if (!response.ok) {
    throw new Error(`Common drop request failed with status ${response.status}.`);
  }
}

export async function forceDeleteCommonRecord(moduleKey: string, id: number) {
  const response = await fetch(
    `${getApiBaseUrl()}/common/${getCommonEndpoint(moduleKey)}/${encodeURIComponent(String(id))}?force=true`,
    { cache: "no-store", method: "DELETE" },
  );

  if (!response.ok) {
    throw new Error(`Common force delete request failed with status ${response.status}.`);
  }
}

function request(method: "POST" | "PATCH", payload: Record<string, unknown>) {
  return {
    body: JSON.stringify(payload),
    cache: "no-store" as const,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    method,
  };
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

function getCommonEndpoint(moduleKey: string) {
  return commonEndpointByKey[moduleKey] ?? moduleKey;
}
