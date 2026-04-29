import type { CompanyRecord } from "../../domain/company-record";

export type CompanyResponse = ReturnType<typeof toCompanyResponse>;

export function toCompanyResponse(company: CompanyRecord) {
  return {
    id: company.id,
    tenantId: company.tenantId,
    tenantName: company.tenantName,
    industryId: company.industryId,
    industryName: company.industryName,
    name: company.name,
    legalName: company.legalName,
    tagline: company.tagline,
    shortAbout: company.shortAbout,
    registrationNumber: company.registrationNumber,
    pan: company.pan,
    financialYearStart: company.financialYearStart,
    booksStart: company.booksStart,
    website: company.website,
    description: company.description,
    primaryEmail: company.primaryEmail,
    primaryPhone: company.primaryPhone,
    isPrimary: company.isPrimary,
    isActive: company.isActive,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
    deletedAt: company.deletedAt ? company.deletedAt.toISOString() : null,
    logos: company.logos,
    addresses: company.addresses,
    emails: company.emails,
    phones: company.phones,
    bankAccounts: company.bankAccounts,
  };
}
