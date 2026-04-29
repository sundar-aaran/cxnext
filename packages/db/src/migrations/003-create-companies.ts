import { sql, type Kysely } from "kysely";

import { defineDatabaseMigration } from "../process/types";

type DynamicDatabase = Record<string, Record<string, unknown>>;

function asQueryDatabase(database: Kysely<unknown>) {
  return database as unknown as Kysely<DynamicDatabase>;
}

export const createCompaniesMigration = defineDatabaseMigration({
  id: "organisation:companies:001-create-companies",
  appId: "organisation",
  moduleKey: "companies",
  name: "Create companies and company detail tables",
  order: 30,
  up: async ({ database }) => {
    const queryDatabase = asQueryDatabase(database);

    await queryDatabase.schema
      .createTable("companies")
      .ifNotExists()
      .addColumn("id", "bigint", (column) => column.primaryKey().autoIncrement())
      .addColumn("tenant_id", "bigint", (column) => column.notNull())
      .addColumn("industry_id", "bigint", (column) => column.notNull())
      .addColumn("name", "varchar(160)", (column) => column.notNull())
      .addColumn("legal_name", "varchar(220)")
      .addColumn("tagline", "varchar(220)")
      .addColumn("short_about", "varchar(500)")
      .addColumn("registration_number", "varchar(80)")
      .addColumn("pan", "varchar(30)")
      .addColumn("financial_year_start", "date")
      .addColumn("books_start", "date")
      .addColumn("website", "varchar(240)")
      .addColumn("description", "text")
      .addColumn("primary_email", "varchar(180)")
      .addColumn("primary_phone", "varchar(80)")
      .addColumn("is_primary", "boolean", (column) => column.notNull().defaultTo(false))
      .addColumn("is_active", "boolean", (column) => column.notNull().defaultTo(true))
      .addColumn("created_at", "datetime", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("updated_at", "datetime", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("deleted_at", "datetime")
      .execute();

    await queryDatabase.schema
      .createIndex("uq_companies_name")
      .ifNotExists()
      .on("companies")
      .column("name")
      .unique()
      .execute();

    await queryDatabase.schema
      .createIndex("idx_companies_tenant_industry")
      .ifNotExists()
      .on("companies")
      .column("tenant_id")
      .column("industry_id")
      .execute();

    await queryDatabase.schema
      .createTable("company_logos")
      .ifNotExists()
      .addColumn("id", "bigint", (column) => column.primaryKey().autoIncrement())
      .addColumn("company_id", "bigint", (column) => column.notNull())
      .addColumn("logo_url", "varchar(500)", (column) => column.notNull())
      .addColumn("logo_type", "varchar(80)", (column) => column.notNull())
      .addColumn("is_active", "boolean", (column) => column.notNull().defaultTo(true))
      .addColumn("created_at", "datetime", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("updated_at", "datetime", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    await queryDatabase.schema
      .createTable("company_addresses")
      .ifNotExists()
      .addColumn("id", "bigint", (column) => column.primaryKey().autoIncrement())
      .addColumn("company_id", "bigint", (column) => column.notNull())
      .addColumn("address_type", "varchar(80)", (column) => column.notNull())
      .addColumn("address_line1", "varchar(240)", (column) => column.notNull())
      .addColumn("address_line2", "varchar(240)")
      .addColumn("city", "varchar(120)")
      .addColumn("district", "varchar(120)")
      .addColumn("state", "varchar(120)")
      .addColumn("country", "varchar(120)")
      .addColumn("pincode", "varchar(20)")
      .addColumn("is_default", "boolean", (column) => column.notNull().defaultTo(false))
      .addColumn("is_active", "boolean", (column) => column.notNull().defaultTo(true))
      .addColumn("created_at", "datetime", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("updated_at", "datetime", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    await queryDatabase.schema
      .createTable("company_emails")
      .ifNotExists()
      .addColumn("id", "bigint", (column) => column.primaryKey().autoIncrement())
      .addColumn("company_id", "bigint", (column) => column.notNull())
      .addColumn("email", "varchar(180)", (column) => column.notNull())
      .addColumn("email_type", "varchar(80)", (column) => column.notNull())
      .addColumn("is_active", "boolean", (column) => column.notNull().defaultTo(true))
      .addColumn("created_at", "datetime", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("updated_at", "datetime", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    await queryDatabase.schema
      .createTable("company_phones")
      .ifNotExists()
      .addColumn("id", "bigint", (column) => column.primaryKey().autoIncrement())
      .addColumn("company_id", "bigint", (column) => column.notNull())
      .addColumn("phone_number", "varchar(80)", (column) => column.notNull())
      .addColumn("phone_type", "varchar(80)", (column) => column.notNull())
      .addColumn("is_primary", "boolean", (column) => column.notNull().defaultTo(false))
      .addColumn("is_active", "boolean", (column) => column.notNull().defaultTo(true))
      .addColumn("created_at", "datetime", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("updated_at", "datetime", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    await queryDatabase.schema
      .createTable("company_bank_accounts")
      .ifNotExists()
      .addColumn("id", "bigint", (column) => column.primaryKey().autoIncrement())
      .addColumn("company_id", "bigint", (column) => column.notNull())
      .addColumn("bank_name", "varchar(160)", (column) => column.notNull())
      .addColumn("account_number", "varchar(80)", (column) => column.notNull())
      .addColumn("account_holder_name", "varchar(180)", (column) => column.notNull())
      .addColumn("ifsc", "varchar(40)", (column) => column.notNull())
      .addColumn("branch", "varchar(160)")
      .addColumn("is_primary", "boolean", (column) => column.notNull().defaultTo(false))
      .addColumn("is_active", "boolean", (column) => column.notNull().defaultTo(true))
      .addColumn("created_at", "datetime", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("updated_at", "datetime", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();
  },
});
