export type CommonMasterModuleKey =
  | "contactGroups"
  | "contactTypes"
  | "addressTypes"
  | "bankNames"
  | "productGroups"
  | "productCategories"
  | "productTypes"
  | "brands"
  | "colours"
  | "sizes"
  | "styles"
  | "units";

export type CommonMasterColumnKey =
  | "code"
  | "name"
  | "description"
  | "image"
  | "positionOrder"
  | "sortOrder"
  | "hexCode"
  | "symbol"
  | "showOnStorefrontTopMenu"
  | "showOnStorefrontCatalog"
  | "isActive";

export interface CommonMasterDefinition {
  readonly key: CommonMasterModuleKey;
  readonly tableName: string;
  readonly label: string;
  readonly listOrder: readonly [string, "asc" | "desc"];
  readonly writableColumns: readonly CommonMasterColumnKey[];
}

export const commonMasterDefinitions = {
  contactGroups: {
    key: "contactGroups",
    tableName: "common_contact_groups",
    label: "Contact Groups",
    listOrder: ["name", "asc"],
    writableColumns: ["code", "name", "description", "isActive"],
  },
  contactTypes: {
    key: "contactTypes",
    tableName: "common_contact_types",
    label: "Contact Types",
    listOrder: ["name", "asc"],
    writableColumns: ["code", "name", "description", "isActive"],
  },
  addressTypes: {
    key: "addressTypes",
    tableName: "common_address_types",
    label: "Address Types",
    listOrder: ["name", "asc"],
    writableColumns: ["code", "name", "description", "isActive"],
  },
  bankNames: {
    key: "bankNames",
    tableName: "common_bank_names",
    label: "Bank Names",
    listOrder: ["name", "asc"],
    writableColumns: ["code", "name", "description", "isActive"],
  },
  productGroups: {
    key: "productGroups",
    tableName: "common_product_groups",
    label: "Product Groups",
    listOrder: ["name", "asc"],
    writableColumns: ["code", "name", "description", "isActive"],
  },
  productCategories: {
    key: "productCategories",
    tableName: "common_product_categories",
    label: "Product Categories",
    listOrder: ["position_order", "asc"],
    writableColumns: [
      "code",
      "name",
      "description",
      "image",
      "positionOrder",
      "showOnStorefrontTopMenu",
      "showOnStorefrontCatalog",
      "isActive",
    ],
  },
  productTypes: {
    key: "productTypes",
    tableName: "common_product_types",
    label: "Product Types",
    listOrder: ["name", "asc"],
    writableColumns: ["code", "name", "description", "isActive"],
  },
  brands: {
    key: "brands",
    tableName: "common_brands",
    label: "Brands",
    listOrder: ["name", "asc"],
    writableColumns: ["code", "name", "description", "isActive"],
  },
  colours: {
    key: "colours",
    tableName: "common_colours",
    label: "Colours",
    listOrder: ["name", "asc"],
    writableColumns: ["code", "name", "description", "hexCode", "isActive"],
  },
  sizes: {
    key: "sizes",
    tableName: "common_sizes",
    label: "Sizes",
    listOrder: ["sort_order", "asc"],
    writableColumns: ["code", "name", "description", "sortOrder", "isActive"],
  },
  styles: {
    key: "styles",
    tableName: "common_styles",
    label: "Styles",
    listOrder: ["name", "asc"],
    writableColumns: ["code", "name", "description", "isActive"],
  },
  units: {
    key: "units",
    tableName: "common_units",
    label: "Units",
    listOrder: ["name", "asc"],
    writableColumns: ["code", "name", "symbol", "description", "isActive"],
  },
} as const satisfies Record<CommonMasterModuleKey, CommonMasterDefinition>;

export function getCommonMasterDefinition(key: CommonMasterModuleKey) {
  return commonMasterDefinitions[key];
}
