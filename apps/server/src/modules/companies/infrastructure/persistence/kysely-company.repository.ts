import { Inject, Injectable, type OnModuleDestroy } from "@nestjs/common";
import { createDatabaseConnection, loadDatabaseEnv, type DatabaseConnection } from "@cxnext/db";
import type {
  CompanyRepository,
  CompanyUpsertParams,
} from "../../application/services/company.repository";
import {
  COMPANY_INDUSTRY_NAME_LOOKUP,
  COMPANY_TENANT_NAME_LOOKUP,
  type CompanyReferenceNameLookup,
} from "../../application/services/company-reference-lookup";
import type {
  CompanyAddressRecord,
  CompanyBankAccountRecord,
  CompanyEmailRecord,
  CompanyLogoRecord,
  CompanyPhoneRecord,
  CompanyRecord,
} from "../../domain/company-record";

type DateValue = Date | string;

interface CompanyBaseRow {
  readonly id: number;
  readonly tenant_id: number;
  readonly industry_id: number;
  readonly name: string;
  readonly legal_name: string | null;
  readonly tagline: string | null;
  readonly short_about: string | null;
  readonly registration_number: string | null;
  readonly pan: string | null;
  readonly financial_year_start: DateValue | null;
  readonly books_start: DateValue | null;
  readonly website: string | null;
  readonly description: string | null;
  readonly primary_email: string | null;
  readonly primary_phone: string | null;
  readonly is_primary: boolean | number;
  readonly is_active: boolean | number;
  readonly created_at: DateValue;
  readonly updated_at: DateValue;
  readonly deleted_at: DateValue | null;
}

@Injectable()
export class KyselyCompanyRepository implements CompanyRepository, OnModuleDestroy {
  private readonly connection: DatabaseConnection;

  public constructor(
    @Inject(COMPANY_TENANT_NAME_LOOKUP)
    private readonly tenantNameLookup: CompanyReferenceNameLookup,
    @Inject(COMPANY_INDUSTRY_NAME_LOOKUP)
    private readonly industryNameLookup: CompanyReferenceNameLookup,
  ) {
    this.connection = createDatabaseConnection(loadDatabaseEnv().env);
  }

  public async onModuleDestroy(): Promise<void> {
    await this.connection.destroy();
  }

  public async list(): Promise<readonly CompanyRecord[]> {
    const rows = await this.selectCompanyBase()
      .where("companies.deleted_at", "is", null)
      .orderBy("companies.id", "asc")
      .execute();
    const displayNames = await this.loadDisplayNames(rows);

    return Promise.all(rows.map((row) => this.toCompanyRecord(row, displayNames)));
  }

  public async getById(companyId: string): Promise<CompanyRecord | null> {
    const numericCompanyId = Number(companyId);

    if (!Number.isInteger(numericCompanyId)) {
      return null;
    }

    const row = await this.selectCompanyBase()
      .where("companies.id", "=", numericCompanyId)
      .where("companies.deleted_at", "is", null)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return this.toCompanyRecord(row, await this.loadDisplayNames([row]));
  }

  public async create(params: CompanyUpsertParams): Promise<CompanyRecord> {
    const now = new Date();
    const result = await this.connection.db
      .insertInto("companies")
      .values(toCompanyValues(params, now))
      .executeTakeFirstOrThrow();
    const company = await this.getById(String(result.insertId));

    if (!company) {
      throw new Error("Company was created but could not be read back.");
    }

    return company;
  }

  public async update(
    companyId: string,
    params: CompanyUpsertParams,
  ): Promise<CompanyRecord | null> {
    const numericCompanyId = Number(companyId);

    if (!Number.isInteger(numericCompanyId)) {
      return null;
    }

    await this.connection.db
      .updateTable("companies")
      .set({
        tenant_id: params.tenantId,
        industry_id: params.industryId,
        name: params.name.trim(),
        legal_name: toNullableString(params.legalName),
        tagline: toNullableString(params.tagline),
        short_about: toNullableString(params.shortAbout),
        registration_number: toNullableString(params.registrationNumber),
        pan: toNullableString(params.pan),
        financial_year_start: toNullableString(params.financialYearStart),
        books_start: toNullableString(params.booksStart),
        website: toNullableString(params.website),
        description: toNullableString(params.description),
        primary_email: toNullableString(params.primaryEmail),
        primary_phone: toNullableString(params.primaryPhone),
        is_primary: params.isPrimary,
        is_active: params.isActive,
        updated_at: new Date(),
      })
      .where("id", "=", numericCompanyId)
      .where("deleted_at", "is", null)
      .executeTakeFirst();

    return this.getById(companyId);
  }

  public async softDelete(companyId: string): Promise<boolean> {
    const numericCompanyId = Number(companyId);

    if (!Number.isInteger(numericCompanyId)) {
      return false;
    }

    const result = await this.connection.db
      .updateTable("companies")
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where("id", "=", numericCompanyId)
      .where("deleted_at", "is", null)
      .executeTakeFirst();

    return Number(result.numUpdatedRows) > 0;
  }

  private selectCompanyBase() {
    return this.connection.db
      .selectFrom("companies")
      .select([
        "companies.id",
        "companies.tenant_id",
        "companies.industry_id",
        "companies.name",
        "companies.legal_name",
        "companies.tagline",
        "companies.short_about",
        "companies.registration_number",
        "companies.pan",
        "companies.financial_year_start",
        "companies.books_start",
        "companies.website",
        "companies.description",
        "companies.primary_email",
        "companies.primary_phone",
        "companies.is_primary",
        "companies.is_active",
        "companies.created_at",
        "companies.updated_at",
        "companies.deleted_at",
      ]);
  }

  private async loadDisplayNames(rows: readonly CompanyBaseRow[]) {
    const [tenantNames, industryNames] = await Promise.all([
      this.tenantNameLookup.findNamesByIds(rows.map((row) => Number(row.tenant_id))),
      this.industryNameLookup.findNamesByIds(rows.map((row) => Number(row.industry_id))),
    ]);

    return { tenantNames, industryNames };
  }

  private async toCompanyRecord(
    row: CompanyBaseRow,
    displayNames: {
      readonly tenantNames: ReadonlyMap<number, string>;
      readonly industryNames: ReadonlyMap<number, string>;
    },
  ): Promise<CompanyRecord> {
    const companyId = Number(row.id);
    const [logos, addresses, emails, phones, bankAccounts] = await Promise.all([
      this.listLogos(companyId),
      this.listAddresses(companyId),
      this.listEmails(companyId),
      this.listPhones(companyId),
      this.listBankAccounts(companyId),
    ]);

    return {
      id: String(row.id),
      tenantId: String(row.tenant_id),
      tenantName: displayNames.tenantNames.get(Number(row.tenant_id)) ?? "",
      industryId: String(row.industry_id),
      industryName: displayNames.industryNames.get(Number(row.industry_id)) ?? "",
      name: row.name,
      legalName: row.legal_name,
      tagline: row.tagline,
      shortAbout: row.short_about,
      registrationNumber: row.registration_number,
      pan: row.pan,
      financialYearStart: toDateOnly(row.financial_year_start),
      booksStart: toDateOnly(row.books_start),
      website: row.website,
      description: row.description,
      primaryEmail: row.primary_email,
      primaryPhone: row.primary_phone,
      isPrimary: Boolean(row.is_primary),
      isActive: Boolean(row.is_active),
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
      deletedAt: row.deleted_at ? toDate(row.deleted_at) : null,
      logos,
      addresses,
      emails,
      phones,
      bankAccounts,
    };
  }

  private async listLogos(companyId: number): Promise<readonly CompanyLogoRecord[]> {
    const rows = await this.connection.db
      .selectFrom("company_logos")
      .selectAll()
      .where("company_id", "=", companyId)
      .orderBy("id", "asc")
      .execute();

    return rows.map((row) => ({
      id: String(row.id),
      logoUrl: row.logo_url,
      logoType: row.logo_type,
      isActive: Boolean(row.is_active),
    }));
  }

  private async listAddresses(companyId: number): Promise<readonly CompanyAddressRecord[]> {
    const rows = await this.connection.db
      .selectFrom("company_addresses")
      .selectAll()
      .where("company_id", "=", companyId)
      .orderBy("id", "asc")
      .execute();

    return rows.map((row) => ({
      id: String(row.id),
      addressType: row.address_type,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      district: row.district,
      state: row.state,
      country: row.country,
      pincode: row.pincode,
      isDefault: Boolean(row.is_default),
      isActive: Boolean(row.is_active),
    }));
  }

  private async listEmails(companyId: number): Promise<readonly CompanyEmailRecord[]> {
    const rows = await this.connection.db
      .selectFrom("company_emails")
      .selectAll()
      .where("company_id", "=", companyId)
      .orderBy("id", "asc")
      .execute();

    return rows.map((row) => ({
      id: String(row.id),
      email: row.email,
      emailType: row.email_type,
      isActive: Boolean(row.is_active),
    }));
  }

  private async listPhones(companyId: number): Promise<readonly CompanyPhoneRecord[]> {
    const rows = await this.connection.db
      .selectFrom("company_phones")
      .selectAll()
      .where("company_id", "=", companyId)
      .orderBy("id", "asc")
      .execute();

    return rows.map((row) => ({
      id: String(row.id),
      phoneNumber: row.phone_number,
      phoneType: row.phone_type,
      isPrimary: Boolean(row.is_primary),
      isActive: Boolean(row.is_active),
    }));
  }

  private async listBankAccounts(companyId: number): Promise<readonly CompanyBankAccountRecord[]> {
    const rows = await this.connection.db
      .selectFrom("company_bank_accounts")
      .selectAll()
      .where("company_id", "=", companyId)
      .orderBy("id", "asc")
      .execute();

    return rows.map((row) => ({
      id: String(row.id),
      bankName: row.bank_name,
      accountNumber: row.account_number,
      accountHolderName: row.account_holder_name,
      ifsc: row.ifsc,
      branch: row.branch,
      isPrimary: Boolean(row.is_primary),
      isActive: Boolean(row.is_active),
    }));
  }
}

function toCompanyValues(params: CompanyUpsertParams, timestamp: Date) {
  return {
    tenant_id: params.tenantId,
    industry_id: params.industryId,
    name: params.name.trim(),
    legal_name: toNullableString(params.legalName),
    tagline: toNullableString(params.tagline),
    short_about: toNullableString(params.shortAbout),
    registration_number: toNullableString(params.registrationNumber),
    pan: toNullableString(params.pan),
    financial_year_start: toNullableString(params.financialYearStart),
    books_start: toNullableString(params.booksStart),
    website: toNullableString(params.website),
    description: toNullableString(params.description),
    primary_email: toNullableString(params.primaryEmail),
    primary_phone: toNullableString(params.primaryPhone),
    is_primary: params.isPrimary,
    is_active: params.isActive,
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
  };
}

function toNullableString(value: string | null | undefined) {
  const trimmedValue = value?.trim() ?? "";
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function toDate(value: DateValue): Date {
  return value instanceof Date ? value : new Date(value);
}

function toDateOnly(value: DateValue | null) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}
