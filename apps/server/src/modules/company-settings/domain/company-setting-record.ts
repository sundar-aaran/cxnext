export type CompanySettingKey = "apps" | "software";

export interface CompanySettingContext {
  readonly companyId: string;
}

export interface CompanySettingRecord {
  readonly companyId: string;
  readonly key: CompanySettingKey;
  readonly values: Record<string, unknown>;
  readonly updatedAt: Date;
}

export interface CompanySettingInput {
  readonly values?: Record<string, unknown>;
}

export const companySettingKeys = ["apps", "software"] as const;
