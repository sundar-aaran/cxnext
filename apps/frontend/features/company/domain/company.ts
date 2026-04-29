import type { MasterListColumnOption, MasterListFilterOption } from "@cxnext/ui";

export interface CompanyRecord {
  readonly id: number;
  readonly tenantId: number;
  readonly tenantName: string;
  readonly industryId: number;
  readonly industryName: string;
  readonly name: string;
  readonly legalName: string | null;
  readonly tagline: string | null;
  readonly shortAbout: string | null;
  readonly registrationNumber: string | null;
  readonly pan: string | null;
  readonly financialYearStart: string | null;
  readonly booksStart: string | null;
  readonly website: string | null;
  readonly description: string | null;
  readonly primaryEmail: string | null;
  readonly primaryPhone: string | null;
  readonly isPrimary: boolean;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly logos: readonly CompanyLogoRecord[];
  readonly addresses: readonly CompanyAddressRecord[];
  readonly emails: readonly CompanyEmailRecord[];
  readonly phones: readonly CompanyPhoneRecord[];
  readonly bankAccounts: readonly CompanyBankAccountRecord[];
}

export interface CompanyLogoRecord {
  readonly id: string;
  readonly logoUrl: string;
  readonly logoType: string;
  readonly isActive: boolean;
}

export interface CompanyAddressRecord {
  readonly id: string;
  readonly addressType: string;
  readonly addressLine1: string;
  readonly addressLine2: string | null;
  readonly city: string | null;
  readonly district: string | null;
  readonly state: string | null;
  readonly country: string | null;
  readonly pincode: string | null;
  readonly isDefault: boolean;
  readonly isActive: boolean;
}

export interface CompanyEmailRecord {
  readonly id: string;
  readonly email: string;
  readonly emailType: string;
  readonly isActive: boolean;
}

export interface CompanyPhoneRecord {
  readonly id: string;
  readonly phoneNumber: string;
  readonly phoneType: string;
  readonly isPrimary: boolean;
  readonly isActive: boolean;
}

export interface CompanyBankAccountRecord {
  readonly id: string;
  readonly bankName: string;
  readonly accountNumber: string;
  readonly accountHolderName: string;
  readonly ifsc: string;
  readonly branch: string | null;
  readonly isPrimary: boolean;
  readonly isActive: boolean;
}

export type CompanyUpsertInput = Pick<
  CompanyRecord,
  | "tenantId"
  | "industryId"
  | "name"
  | "legalName"
  | "tagline"
  | "shortAbout"
  | "registrationNumber"
  | "pan"
  | "financialYearStart"
  | "booksStart"
  | "website"
  | "description"
  | "primaryEmail"
  | "primaryPhone"
  | "isPrimary"
  | "isActive"
>;

export type CompanyStatusFilter = "all" | "active" | "inactive";
export type CompanyColumnId = "name" | "tenant" | "industry" | "status" | "updated";

export const companyStatusFilters: readonly MasterListFilterOption[] = [
  { id: "all", label: "All companies" },
  { id: "active", label: "active" },
  { id: "inactive", label: "inactive" },
];

export const companyColumnCatalog = [
  { id: "name", label: "Company" },
  { id: "tenant", label: "Tenant" },
  { id: "industry", label: "Industry" },
  { id: "status", label: "Status" },
  { id: "updated", label: "Updated" },
] as const satisfies readonly {
  readonly id: CompanyColumnId;
  readonly label: string;
}[];

export const defaultCompanyColumnVisibility: Record<CompanyColumnId, boolean> = {
  name: true,
  tenant: true,
  industry: true,
  status: true,
  updated: true,
};

export type CompanyColumnOption = MasterListColumnOption;
