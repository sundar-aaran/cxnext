import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRootEnv, resolveRuntimeEnv } from "../../scripts/runtime-env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
loadRootEnv(root);

const env = resolveRuntimeEnv();
const apiUrl = env.NEXT_PUBLIC_API_URL;
const login = process.env.API_E2E_LOGIN || "sundar";
const password = process.env.API_E2E_PASSWORD || env.AUTH_DEFAULT_ADMIN_PASSWORD || "Admin@1234";
const results = [];

async function main() {
  await expectStatus(env.BACKEND_HEALTH_URL, 200, "health");
  await expectStatus(`${apiUrl}/setup/status`, 200, "setup status");
  await expectStatus(`${apiUrl}/auth/me`, 401, "protected auth/me rejects anonymous access");

  const session = await expectJson(
    `${apiUrl}/auth/login`,
    {
      body: JSON.stringify({ login, password }),
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      method: "POST",
    },
    201,
    "login",
  );

  if (!session.accessToken) {
    throw new Error("External login did not return an access token.");
  }

  const authHeaders = {
    Accept: "application/json",
    Authorization: `Bearer ${session.accessToken}`,
  };
  const context = await expectJson(
    `${apiUrl}/application/default-company`,
    { headers: authHeaders },
    200,
    "application default company",
  );
  const companyId = String(context.company?.id ?? "");
  const accountingYearId = String(context.accountingYear?.id ?? "");

  if (!companyId || !accountingYearId) {
    throw new Error("Default application context did not include company and accounting year ids.");
  }

  const readOnlyRoutes = [
    ["auth me", "/auth/me"],
    ["auth users", "/auth/users"],
    ["auth roles", "/auth/roles"],
    ["auth permissions", "/auth/permissions"],
    ["auth policies", "/auth/policies"],
    ["auth gates", "/auth/gates"],
    ["tenants", "/tenants"],
    ["companies", "/companies"],
    ["industries", "/industries"],
    ["contacts", "/contacts"],
    ["products", "/products"],
    ["application default companies", "/application/default-companies"],
    ["common accounting years", "/common/accounting-years"],
    ["common address types", "/common/address-types"],
    ["common bank names", "/common/bank-names"],
    ["common brands", "/common/brands"],
    ["common cities", "/common/cities"],
    ["common colours", "/common/colours"],
    ["common contact groups", "/common/contact-groups"],
    ["common contact types", "/common/contact-types"],
    ["common countries", "/common/countries"],
    ["common currencies", "/common/currencies"],
    ["common destinations", "/common/destinations"],
    ["common districts", "/common/districts"],
    ["common hsn codes", "/common/hsn-codes"],
    ["common months", "/common/months"],
    ["common order types", "/common/order-types"],
    ["common payment terms", "/common/payment-terms"],
    ["common pincodes", "/common/pincodes"],
    ["common product categories", "/common/product-categories"],
    ["common product groups", "/common/product-groups"],
    ["common product types", "/common/product-types"],
    ["common sizes", "/common/sizes"],
    ["common states", "/common/states"],
    ["common stock rejection types", "/common/stock-rejection-types"],
    ["common styles", "/common/styles"],
    ["common taxes", "/common/taxes"],
    ["common transports", "/common/transports"],
    ["common units", "/common/units"],
    ["common warehouses", "/common/warehouses"],
    ["core settings env", "/core-settings/env"],
    ["system update status", "/system-update/status"],
  ];

  for (const [label, route] of readOnlyRoutes) {
    await expectStatus(`${apiUrl}${route}`, 200, label, { headers: authHeaders });
  }

  const contextQuery = new URLSearchParams({ accountingYearId, companyId }).toString();
  const contextRoutes = [
    ["entries sales", "/entries/sales"],
    ["entries purchase", "/entries/purchase"],
    ["entries payment", "/entries/payment"],
    ["entries receipt", "/entries/receipt"],
    ["document settings numbers", "/document-settings/numbers"],
    ["next sales document number", "/document-settings/numbers/sales/next"],
  ];

  for (const [label, route] of contextRoutes) {
    await expectStatus(`${apiUrl}${route}?${contextQuery}`, 200, label, {
      headers: authHeaders,
    });
  }

  await expectStatus(
    `${apiUrl}/media?companyId=${encodeURIComponent(companyId)}&visibility=public&folder=`,
    200,
    "media list",
    { headers: authHeaders },
  );

  await expectStatus(`${apiUrl}/contacts`, 401, "protected contacts reject anonymous access");

  process.stdout.write(`${JSON.stringify({ ok: true, results }, null, 2)}\n`);
}

async function expectJson(url, init, expectedStatus, label) {
  const response = await fetch(url, init);
  const body = await readBody(response);

  if (response.status !== expectedStatus) {
    throw new Error(`${label} expected HTTP ${expectedStatus}, received ${response.status}: ${body}`);
  }

  results.push({ detail: String(response.status), name: label, status: "passed" });
  return body ? JSON.parse(body) : null;
}

async function expectStatus(url, expectedStatus, label, init = {}) {
  const response = await fetch(url, init);
  const body = await readBody(response);

  if (response.status !== expectedStatus) {
    throw new Error(`${label} expected HTTP ${expectedStatus}, received ${response.status}: ${body}`);
  }

  results.push({ detail: String(response.status), name: label, status: "passed" });
}

async function readBody(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

main().catch((error) => {
  process.stderr.write(
    `${JSON.stringify(
      {
        error: error instanceof Error ? error.message : String(error),
        ok: false,
        results,
      },
      null,
      2,
    )}\n`,
  );
  process.exitCode = 1;
});
