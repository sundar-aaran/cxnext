export interface CompanyReferenceNameLookup {
  findNamesByIds(ids: readonly number[]): Promise<ReadonlyMap<number, string>>;
}

export const COMPANY_TENANT_NAME_LOOKUP = Symbol("COMPANY_TENANT_NAME_LOOKUP");
export const COMPANY_INDUSTRY_NAME_LOOKUP = Symbol("COMPANY_INDUSTRY_NAME_LOOKUP");
