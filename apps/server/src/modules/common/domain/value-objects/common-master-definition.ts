export type CommonMasterModuleKey =
  | "contactGroups"
  | "contactTypes"
  | "addressTypes"
  | "bankNames";

export type CommonMasterColumnKey = "code" | "name" | "description" | "isActive";

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
} as const satisfies Record<CommonMasterModuleKey, CommonMasterDefinition>;

export function getCommonMasterDefinition(key: CommonMasterModuleKey) {
  return commonMasterDefinitions[key];
}
