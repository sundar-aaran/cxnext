export type CommonColumnType = "string" | "number" | "boolean";

export interface CommonColumnDefinition {
  readonly key: string;
  readonly label: string;
  readonly type: CommonColumnType;
  readonly required?: boolean;
  readonly nullable?: boolean;
}

export interface CommonModuleDefinition {
  readonly key: string;
  readonly label: string;
  readonly tableName: string;
  readonly defaultSortKey: string;
  readonly idPrefix: string;
  readonly columns: readonly CommonColumnDefinition[];
}

export type CommonRecord = Record<string, unknown> & {
  readonly id: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
};

export type CommonReferenceLookupMap = Record<string, ReadonlyMap<string, string>>;
type ReferenceModuleKey = "countries" | "states" | "districts" | "cities";

export const commonMenuGroups = [
  { label: "Location", items: ["countries", "states", "districts", "cities", "pincodes"] },
  { label: "Contacts", items: ["contactGroups", "contactTypes", "addressTypes", "bankNames"] },
  {
    label: "Product",
    items: [
      "productGroups",
      "productCategories",
      "productTypes",
      "brands",
      "colours",
      "sizes",
      "styles",
      "units",
      "hsnCodes",
      "taxes",
    ],
  },
  {
    label: "Orders",
    items: ["warehouses", "transports", "destinations", "orderTypes", "stockRejectionTypes"],
  },
  { label: "Others", items: ["currencies", "paymentTerms"] },
] as const;

export const commonMenuLabels: Record<string, string> = {
  countries: "Countries",
  states: "States",
  districts: "Districts",
  cities: "Cities",
  pincodes: "Pincodes",
  contactGroups: "Contact Groups",
  contactTypes: "Contact Types",
  addressTypes: "Address Types",
  bankNames: "Bank Names",
  productGroups: "Product Groups",
  productCategories: "Product Categories",
  productTypes: "Product Types",
  units: "Units",
  hsnCodes: "HSN Codes",
  taxes: "Taxes",
  brands: "Brands",
  colours: "Colours",
  sizes: "Sizes",
  currencies: "Currencies",
  orderTypes: "Order Types",
  styles: "Styles",
  transports: "Transports",
  warehouses: "Warehouses",
  destinations: "Destinations",
  paymentTerms: "Payment Terms",
  stockRejectionTypes: "Stock Rejection Types",
  storefrontTemplates: "Storefront Templates",
  sliderThemes: "Slider Themes",
};

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

const codeNameDescription = [
  { key: "code", label: "Code", type: "string" as const, required: true, nullable: false },
  { key: "name", label: "Name", type: "string" as const, required: true, nullable: false },
  { key: "description", label: "Description", type: "string" as const, nullable: true },
] satisfies readonly CommonColumnDefinition[];

function simpleModule(key: string, tableName: string, idPrefix: string): CommonModuleDefinition {
  return {
    key,
    label: commonMenuLabels[key] ?? key,
    tableName,
    defaultSortKey: "name",
    idPrefix,
    columns: codeNameDescription,
  };
}

export const fallbackCommonModules: readonly CommonModuleDefinition[] = [
  {
    key: "countries",
    label: "Countries",
    tableName: "common_countries",
    defaultSortKey: "name",
    idPrefix: "country",
    columns: [
      { key: "code", label: "Code", type: "string", required: true, nullable: false },
      { key: "name", label: "Name", type: "string", required: true, nullable: false },
      { key: "phone_code", label: "Phone Code", type: "string", nullable: true },
    ],
  },
  {
    key: "states",
    label: "States",
    tableName: "common_states",
    defaultSortKey: "name",
    idPrefix: "state",
    columns: [
      { key: "country_id", label: "Country", type: "number", required: true, nullable: false },
      { key: "code", label: "Code", type: "string", required: true, nullable: false },
      { key: "name", label: "Name", type: "string", required: true, nullable: false },
    ],
  },
  {
    key: "districts",
    label: "Districts",
    tableName: "common_districts",
    defaultSortKey: "name",
    idPrefix: "district",
    columns: [
      { key: "state_id", label: "State", type: "number", required: true, nullable: false },
      { key: "code", label: "Code", type: "string", required: true, nullable: false },
      { key: "name", label: "Name", type: "string", required: true, nullable: false },
    ],
  },
  {
    key: "cities",
    label: "Cities",
    tableName: "common_cities",
    defaultSortKey: "name",
    idPrefix: "city",
    columns: [
      { key: "state_id", label: "State", type: "number", required: true, nullable: false },
      { key: "district_id", label: "District", type: "number", required: true, nullable: false },
      { key: "code", label: "Code", type: "string", required: true, nullable: false },
      { key: "name", label: "Name", type: "string", required: true, nullable: false },
    ],
  },
  {
    key: "pincodes",
    label: "Pincodes",
    tableName: "common_pincodes",
    defaultSortKey: "code",
    idPrefix: "pincode",
    columns: [
      { key: "country_id", label: "Country", type: "number", required: true, nullable: false },
      { key: "state_id", label: "State", type: "number", required: true, nullable: false },
      { key: "district_id", label: "District", type: "number", required: true, nullable: false },
      { key: "city_id", label: "City", type: "number", required: true, nullable: false },
      { key: "code", label: "Pincode", type: "string", required: true, nullable: false },
      { key: "area_name", label: "Area Name", type: "string", nullable: true },
    ],
  },
  simpleModule("contactGroups", "common_contact_groups", "contact-group"),
  simpleModule("contactTypes", "common_contact_types", "contact-type"),
  simpleModule("addressTypes", "common_address_types", "address-type"),
  simpleModule("bankNames", "common_bank_names", "bank-name"),
  simpleModule("productGroups", "common_product_groups", "product-group"),
  {
    key: "productCategories",
    label: "Product Categories",
    tableName: "common_product_categories",
    defaultSortKey: "position_order",
    idPrefix: "product-category",
    columns: [
      ...codeNameDescription,
      { key: "image", label: "Image", type: "string", nullable: true },
      { key: "position_order", label: "Position Order", type: "number" },
      { key: "show_on_storefront_top_menu", label: "Show On Storefront Top Menu", type: "boolean" },
      { key: "show_on_storefront_catalog", label: "Show On Storefront Catalog", type: "boolean" },
    ],
  },
  simpleModule("productTypes", "common_product_types", "product-type"),
  {
    key: "units",
    label: "Units",
    tableName: "common_units",
    defaultSortKey: "name",
    idPrefix: "unit",
    columns: [
      { key: "code", label: "Code", type: "string", required: true, nullable: false },
      { key: "name", label: "Name", type: "string", required: true, nullable: false },
      { key: "symbol", label: "Symbol", type: "string", nullable: true },
      { key: "description", label: "Description", type: "string", nullable: true },
    ],
  },
  {
    key: "hsnCodes",
    label: "HSN Codes",
    tableName: "common_hsn_codes",
    defaultSortKey: "code",
    idPrefix: "hsn",
    columns: [
      { key: "code", label: "Code", type: "string", required: true, nullable: false },
      { key: "name", label: "Name", type: "string", required: true, nullable: false },
      { key: "description", label: "Description", type: "string", required: true, nullable: false },
    ],
  },
  {
    key: "taxes",
    label: "Taxes",
    tableName: "common_taxes",
    defaultSortKey: "name",
    idPrefix: "tax",
    columns: [
      { key: "code", label: "Code", type: "string", required: true, nullable: false },
      { key: "name", label: "Name", type: "string", required: true, nullable: false },
      { key: "tax_type", label: "Tax Type", type: "string", required: true, nullable: false },
      {
        key: "rate_percent",
        label: "Rate Percent",
        type: "number",
        required: true,
        nullable: false,
      },
      { key: "description", label: "Description", type: "string", nullable: true },
    ],
  },
  simpleModule("brands", "common_brands", "brand"),
  {
    key: "colours",
    label: "Colours",
    tableName: "common_colours",
    defaultSortKey: "name",
    idPrefix: "colour",
    columns: [
      ...codeNameDescription,
      { key: "hex_code", label: "Hex Code", type: "string", nullable: true },
    ],
  },
  {
    key: "sizes",
    label: "Sizes",
    tableName: "common_sizes",
    defaultSortKey: "sort_order",
    idPrefix: "size",
    columns: [...codeNameDescription, { key: "sort_order", label: "Sort Order", type: "number" }],
  },
  {
    key: "currencies",
    label: "Currencies",
    tableName: "common_currencies",
    defaultSortKey: "code",
    idPrefix: "currency",
    columns: [
      { key: "code", label: "Code", type: "string", required: true, nullable: false },
      { key: "name", label: "Name", type: "string", required: true, nullable: false },
      { key: "symbol", label: "Symbol", type: "string", required: true, nullable: false },
      { key: "decimal_places", label: "Decimal Places", type: "number" },
    ],
  },
  simpleModule("orderTypes", "common_order_types", "order-type"),
  simpleModule("styles", "common_styles", "style"),
  simpleModule("transports", "common_transports", "transport"),
  simpleModule("destinations", "common_destinations", "destination"),
  {
    key: "paymentTerms",
    label: "Payment Terms",
    tableName: "common_payment_terms",
    defaultSortKey: "name",
    idPrefix: "payment-term",
    columns: [...codeNameDescription, { key: "due_days", label: "Due Days", type: "number" }],
  },
  simpleModule("stockRejectionTypes", "common_stock_rejection_types", "stock-rejection-type"),
  {
    key: "warehouses",
    label: "Warehouses",
    tableName: "common_warehouses",
    defaultSortKey: "name",
    idPrefix: "warehouse",
    columns: [
      { key: "code", label: "Code", type: "string", required: true, nullable: false },
      { key: "name", label: "Name", type: "string", required: true, nullable: false },
      { key: "is_default_location", label: "Default Location", type: "boolean" },
      { key: "country", label: "Country", type: "string", nullable: true },
      { key: "state", label: "State", type: "string", nullable: true },
      { key: "district", label: "District", type: "string", nullable: true },
      { key: "city", label: "City", type: "string", nullable: true },
      { key: "pincode", label: "Pincode", type: "string", nullable: true },
      { key: "address_line1", label: "Address Line 1", type: "string", nullable: true },
      { key: "address_line2", label: "Address Line 2", type: "string", nullable: true },
      { key: "description", label: "Description", type: "string", nullable: true },
    ],
  },
  {
    key: "storefrontTemplates",
    label: "Storefront Templates",
    tableName: "common_storefront_templates",
    defaultSortKey: "sort_order",
    idPrefix: "storefront-template",
    columns: [
      { key: "code", label: "Code", type: "string", required: true, nullable: false },
      { key: "name", label: "Name", type: "string", required: true, nullable: false },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "badge_text", label: "Badge", type: "string", nullable: true },
      { key: "title", label: "Title", type: "string", required: true, nullable: false },
      { key: "description", label: "Description", type: "string", nullable: true },
    ],
  },
  {
    key: "sliderThemes",
    label: "Slider Themes",
    tableName: "common_slider_themes",
    defaultSortKey: "sort_order",
    idPrefix: "slider-theme",
    columns: [
      { key: "code", label: "Code", type: "string", required: true, nullable: false },
      { key: "name", label: "Name", type: "string", required: true, nullable: false },
      { key: "sort_order", label: "Sort Order", type: "number" },
      {
        key: "background_from",
        label: "Background From",
        type: "string",
        required: true,
        nullable: false,
      },
      {
        key: "background_via",
        label: "Background Via",
        type: "string",
        required: true,
        nullable: false,
      },
      {
        key: "background_to",
        label: "Background To",
        type: "string",
        required: true,
        nullable: false,
      },
    ],
  },
];

export async function listCommonModules(options?: { readonly signal?: AbortSignal }) {
  const response = await fetch(`${getApiBaseUrl()}/common/modules`, {
    cache: "no-store",
    signal: options?.signal,
  });
  if (!response.ok)
    throw new Error(`Common metadata request failed with status ${response.status}.`);
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
  if (!response.ok) throw new Error(`Common list request failed with status ${response.status}.`);
  return (await response.json()) as CommonRecord[];
}

export async function listCommonReferenceLookups(
  definition: CommonModuleDefinition,
  options?: { readonly signal?: AbortSignal },
): Promise<CommonReferenceLookupMap> {
  const lookupEntries = await Promise.all(
    definition.columns
      .map((column) => [column.key, getReferenceModuleKey(column.key)] as const)
      .filter((entry): entry is readonly [string, ReferenceModuleKey] => Boolean(entry[1]))
      .map(async ([columnKey, moduleKey]) => {
        const records = await listCommonRecords(moduleKey, options);
        return [columnKey, toDisplayLookup(records)] as const;
      }),
  );

  return Object.fromEntries(lookupEntries);
}

export async function createCommonRecord(moduleKey: string, payload: Record<string, unknown>) {
  const response = await fetch(
    `${getApiBaseUrl()}/common/${getCommonEndpoint(moduleKey)}`,
    request("POST", payload),
  );
  if (!response.ok) throw new Error(`Common create request failed with status ${response.status}.`);
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
  if (!response.ok) throw new Error(`Common update request failed with status ${response.status}.`);
  return (await response.json()) as CommonRecord;
}

export async function dropCommonRecord(moduleKey: string, id: number) {
  const response = await fetch(
    `${getApiBaseUrl()}/common/${getCommonEndpoint(moduleKey)}/${encodeURIComponent(String(id))}`,
    { cache: "no-store", method: "DELETE" },
  );
  if (!response.ok) throw new Error(`Common drop request failed with status ${response.status}.`);
}

export async function forceDeleteCommonRecord(moduleKey: string, id: number) {
  const response = await fetch(
    `${getApiBaseUrl()}/common/${getCommonEndpoint(moduleKey)}/${encodeURIComponent(String(id))}?force=true`,
    { cache: "no-store", method: "DELETE" },
  );
  if (!response.ok)
    throw new Error(`Common force delete request failed with status ${response.status}.`);
}

export function formatCommonDate(value: unknown) {
  if (!value || typeof value !== "string") return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
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

function getReferenceModuleKey(columnKey: string): ReferenceModuleKey | null {
  if (columnKey === "country_id") return "countries";
  if (columnKey === "state_id") return "states";
  if (columnKey === "district_id") return "districts";
  if (columnKey === "city_id") return "cities";
  return null;
}

function toDisplayLookup(records: readonly CommonRecord[]) {
  return new Map(
    records.map((record) => [
      String(record.id),
      String(record.name ?? record.areaName ?? record.code ?? record.id),
    ]),
  );
}
