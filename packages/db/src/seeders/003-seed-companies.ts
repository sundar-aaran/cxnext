import type { Kysely } from "kysely";

import { defineDatabaseSeeder } from "../process/types";

type DynamicDatabase = Record<string, Record<string, unknown>>;

const timestamp = "2026-04-28 09:00:00";

const companySeeds = [
  {
    name: "Codexsun Commerce",
    tenantName: "Codexsun Commerce",
    industryName: "Computer - Ecommerce",
    legal_name: "Codexsun Commerce Private Limited",
    tagline: "Suite-first commerce and operations software.",
    short_about: "Connected business software for billing, commerce, and operations.",
    registration_number: "U72900TZ2026PTC001201",
    pan: "AACCC1234K",
    financial_year_start: "2026-04-01",
    books_start: "2026-04-01",
    website: "https://codexsun.example.com",
    description: "Primary suite operator for shared ERP, commerce, and deployment workflows.",
    primary_email: "hello@codexsun.example.com",
    primary_phone: "+91 90000 00001",
    is_primary: true,
    is_active: true,
    logo: {
      logo_url: "https://placehold.co/160x160/f4efe8/2b211a?text=CS",
      logo_type: "primary",
    },
    address: {
      address_type: "office",
      address_line1: "18 North Residency, Cathedral Road",
      address_line2: "Nungambakkam",
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      pincode: "600001",
    },
    emails: [
      { email: "hello@codexsun.example.com", email_type: "support" },
      { email: "ops@codexsun.example.com", email_type: "operations" },
    ],
    phone: {
      phone_number: "+91 90000 00001",
      phone_type: "office",
    },
    bank: {
      bank_name: "Axis Bank",
      account_number: "001234567890",
      account_holder_name: "Codexsun Commerce Private Limited",
      ifsc: "UTIB0000123",
      branch: "Anna Salai",
    },
  },
  {
    name: "Loomline Retail",
    tenantName: "Codexsun Commerce",
    industryName: "Garments - Ecommerce",
    legal_name: "Loomline Retail LLP",
    tagline: "Pilot storefront and retail operations tenant.",
    short_about: "Pilot retail company used for storefront validation.",
    registration_number: "AAM-440021",
    pan: "AACFL9876R",
    financial_year_start: "2026-04-01",
    books_start: "2026-04-01",
    website: "https://loomline.example.com",
    description: "Pilot commerce tenant used to validate shared masters and storefront workflows.",
    primary_email: "hello@loomline.example.com",
    primary_phone: "+91 90000 00041",
    is_primary: false,
    is_active: true,
    logo: {
      logo_url: "https://placehold.co/160x160/f7e8db/4a2b1f?text=LL",
      logo_type: "primary",
    },
    address: {
      address_type: "branch",
      address_line1: "6 Residency Arcade",
      address_line2: "Indiranagar",
      city: "Bengaluru",
      district: "Bengaluru",
      state: "Karnataka",
      country: "India",
      pincode: "560001",
    },
    emails: [{ email: "hello@loomline.example.com", email_type: "sales" }],
    phone: {
      phone_number: "+91 90000 00041",
      phone_type: "office",
    },
    bank: {
      bank_name: "HDFC Bank",
      account_number: "009876543210",
      account_holder_name: "Loomline Retail LLP",
      ifsc: "HDFC0000456",
      branch: "Indiranagar",
    },
  },
] as const;

function asQueryDatabase(database: Kysely<unknown>) {
  return database as unknown as Kysely<DynamicDatabase>;
}

function requireSeedRecord<T>(record: T | undefined, label: string): T {
  if (!record) {
    throw new Error(`Missing seed dependency: ${label}`);
  }
  return record;
}

export const seedCompaniesSeeder = defineDatabaseSeeder({
  id: "organisation:companies:001-seed-companies",
  appId: "organisation",
  moduleKey: "companies",
  name: "Seed default companies",
  order: 30,
  run: async ({ database }) => {
    const queryDatabase = asQueryDatabase(database);

    for (const company of companySeeds) {
      const existingCompany = await queryDatabase
        .selectFrom("companies")
        .select("id")
        .where("name", "=", company.name)
        .executeTakeFirst();

      if (existingCompany) {
        continue;
      }

      const tenant = await queryDatabase
        .selectFrom("tenants")
        .select("id")
        .where("name", "=", company.tenantName)
        .executeTakeFirst()
        .then((record) => requireSeedRecord(record, `tenant ${company.tenantName}`));
      const industry = await queryDatabase
        .selectFrom("industries")
        .select("id")
        .where("name", "=", company.industryName)
        .executeTakeFirst()
        .then((record) => requireSeedRecord(record, `industry ${company.industryName}`));

      const [result] = await queryDatabase
        .insertInto("companies")
        .values({
          tenant_id: tenant.id,
          industry_id: industry.id,
          name: company.name,
          legal_name: company.legal_name,
          tagline: company.tagline,
          short_about: company.short_about,
          registration_number: company.registration_number,
          pan: company.pan,
          financial_year_start: company.financial_year_start,
          books_start: company.books_start,
          website: company.website,
          description: company.description,
          primary_email: company.primary_email,
          primary_phone: company.primary_phone,
          is_primary: company.is_primary,
          is_active: company.is_active,
          created_at: timestamp,
          updated_at: timestamp,
          deleted_at: null,
        })
        .execute();
      const companyId = Number(result?.insertId);

      await queryDatabase
        .insertInto("company_logos")
        .values({
          company_id: companyId,
          logo_url: company.logo.logo_url,
          logo_type: company.logo.logo_type,
          is_active: true,
          created_at: timestamp,
          updated_at: timestamp,
        })
        .execute();

      await queryDatabase
        .insertInto("company_addresses")
        .values({
          company_id: companyId,
          ...company.address,
          is_default: true,
          is_active: true,
          created_at: timestamp,
          updated_at: timestamp,
        })
        .execute();

      for (const email of company.emails) {
        await queryDatabase
          .insertInto("company_emails")
          .values({
            company_id: companyId,
            ...email,
            is_active: true,
            created_at: timestamp,
            updated_at: timestamp,
          })
          .execute();
      }

      await queryDatabase
        .insertInto("company_phones")
        .values({
          company_id: companyId,
          ...company.phone,
          is_primary: true,
          is_active: true,
          created_at: timestamp,
          updated_at: timestamp,
        })
        .execute();

      await queryDatabase
        .insertInto("company_bank_accounts")
        .values({
          company_id: companyId,
          ...company.bank,
          is_primary: true,
          is_active: true,
          created_at: timestamp,
          updated_at: timestamp,
        })
        .execute();
    }
  },
});
