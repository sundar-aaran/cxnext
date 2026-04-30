import type { ProductRecord, ProductUpsertInput } from "../domain/product";

interface ProductApiRecord extends Omit<ProductRecord, "id"> {
  readonly id: string;
}

export async function listProducts(options?: { readonly signal?: AbortSignal }) {
  const response = await fetch(`${getApiBaseUrl()}/products`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`Product list request failed with status ${response.status}.`);
  }

  return ((await response.json()) as ProductApiRecord[]).map(toProductRecord);
}

export async function getProduct(productId: number, options?: { readonly signal?: AbortSignal }) {
  const response = await fetch(`${getApiBaseUrl()}/products/${productId}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Product detail request failed with status ${response.status}.`);
  }

  return toProductRecord((await response.json()) as ProductApiRecord);
}

export async function upsertProduct(input: ProductUpsertInput, productId?: number) {
  const response = await fetch(`${getApiBaseUrl()}/products${productId ? `/${productId}` : ""}`, {
    body: JSON.stringify(input),
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: productId ? "PATCH" : "POST",
  });

  if (!response.ok) {
    throw new Error(`Product save request failed with status ${response.status}.`);
  }

  return toProductRecord((await response.json()) as ProductApiRecord);
}

export async function softDeleteProduct(productId: number) {
  const response = await fetch(`${getApiBaseUrl()}/products/${productId}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Product delete request failed with status ${response.status}.`);
  }
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

function toProductRecord(record: ProductApiRecord): ProductRecord {
  return {
    ...record,
    id: Number(record.id),
  };
}
