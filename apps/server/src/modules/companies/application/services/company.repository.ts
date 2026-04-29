import type { CompanyRecord } from "../../domain/company-record";

export interface CompanyUpsertParams {
  readonly tenantId: number;
  readonly industryId: number;
  readonly name: string;
  readonly legalName?: string | null;
  readonly tagline?: string | null;
  readonly shortAbout?: string | null;
  readonly registrationNumber?: string | null;
  readonly pan?: string | null;
  readonly financialYearStart?: string | null;
  readonly booksStart?: string | null;
  readonly website?: string | null;
  readonly description?: string | null;
  readonly primaryEmail?: string | null;
  readonly primaryPhone?: string | null;
  readonly isPrimary: boolean;
  readonly isActive: boolean;
}

export interface CompanyRepository {
  list(): Promise<readonly CompanyRecord[]>;
  getById(companyId: string): Promise<CompanyRecord | null>;
  create(params: CompanyUpsertParams): Promise<CompanyRecord>;
  update(companyId: string, params: CompanyUpsertParams): Promise<CompanyRecord | null>;
  softDelete(companyId: string): Promise<boolean>;
}

export const COMPANY_REPOSITORY = Symbol("COMPANY_REPOSITORY");
