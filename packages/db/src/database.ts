import { Kysely, MysqlDialect, type ColumnType, type Generated } from "kysely";
import { createPool, type PoolOptions } from "mysql2";
import { z } from "zod";

type TimestampColumn = ColumnType<Date, Date | string | undefined, Date | string>;
type NullableTimestampColumn = ColumnType<
  Date | null,
  Date | string | null | undefined,
  Date | string | null
>;

export interface TenantsTable {
  readonly id: Generated<number>;
  readonly name: string;
  readonly slug: string;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
  readonly deleted_at: NullableTimestampColumn;
}

export interface IndustriesTable {
  readonly id: Generated<number>;
  readonly name: string;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
  readonly deleted_at: NullableTimestampColumn;
}

export interface CompaniesTable {
  readonly id: Generated<number>;
  readonly tenant_id: number;
  readonly industry_id: number;
  readonly name: string;
  readonly legal_name: string | null;
  readonly tagline: string | null;
  readonly short_about: string | null;
  readonly registration_number: string | null;
  readonly pan: string | null;
  readonly financial_year_start: ColumnType<
    Date | null,
    Date | string | null | undefined,
    Date | string | null
  >;
  readonly books_start: ColumnType<
    Date | null,
    Date | string | null | undefined,
    Date | string | null
  >;
  readonly website: string | null;
  readonly description: string | null;
  readonly primary_email: string | null;
  readonly primary_phone: string | null;
  readonly is_primary: Generated<boolean>;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
  readonly deleted_at: NullableTimestampColumn;
}

export interface CompanyLogosTable {
  readonly id: Generated<number>;
  readonly company_id: number;
  readonly logo_url: string;
  readonly logo_type: string;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
}

export interface CompanyAddressesTable {
  readonly id: Generated<number>;
  readonly company_id: number;
  readonly address_type: string;
  readonly address_line1: string;
  readonly address_line2: string | null;
  readonly city: string | null;
  readonly district: string | null;
  readonly state: string | null;
  readonly country: string | null;
  readonly pincode: string | null;
  readonly is_default: Generated<boolean>;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
}

export interface CompanyEmailsTable {
  readonly id: Generated<number>;
  readonly company_id: number;
  readonly email: string;
  readonly email_type: string;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
}

export interface CompanyPhonesTable {
  readonly id: Generated<number>;
  readonly company_id: number;
  readonly phone_number: string;
  readonly phone_type: string;
  readonly is_primary: Generated<boolean>;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
}

export interface CompanyBankAccountsTable {
  readonly id: Generated<number>;
  readonly company_id: number;
  readonly bank_name: string;
  readonly account_number: string;
  readonly account_holder_name: string;
  readonly ifsc: string;
  readonly branch: string | null;
  readonly is_primary: Generated<boolean>;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
}

export interface CommonCountriesTable {
  readonly id: Generated<number>;
  readonly code: string;
  readonly name: string;
  readonly phone_code: string | null;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
  readonly deleted_at: NullableTimestampColumn;
}

export interface CommonStatesTable {
  readonly id: Generated<number>;
  readonly country_id: number;
  readonly code: string;
  readonly name: string;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
  readonly deleted_at: NullableTimestampColumn;
}

export interface CommonDistrictsTable {
  readonly id: Generated<number>;
  readonly state_id: number;
  readonly code: string;
  readonly name: string;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
  readonly deleted_at: NullableTimestampColumn;
}

export interface CommonCitiesTable {
  readonly id: Generated<number>;
  readonly state_id: number;
  readonly district_id: number;
  readonly code: string;
  readonly name: string;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
  readonly deleted_at: NullableTimestampColumn;
}

export interface CommonPincodesTable {
  readonly id: Generated<number>;
  readonly country_id: number;
  readonly state_id: number;
  readonly district_id: number;
  readonly city_id: number;
  readonly code: string;
  readonly area_name: string | null;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
  readonly deleted_at: NullableTimestampColumn;
}

export interface DatabaseSchema {
  readonly companies: CompaniesTable;
  readonly company_addresses: CompanyAddressesTable;
  readonly company_bank_accounts: CompanyBankAccountsTable;
  readonly company_emails: CompanyEmailsTable;
  readonly company_logos: CompanyLogosTable;
  readonly company_phones: CompanyPhonesTable;
  readonly common_cities: CommonCitiesTable;
  readonly common_countries: CommonCountriesTable;
  readonly common_districts: CommonDistrictsTable;
  readonly common_pincodes: CommonPincodesTable;
  readonly common_states: CommonStatesTable;
  readonly industries: IndustriesTable;
  readonly tenants: TenantsTable;
}

export const databaseEnvSchema = z.object({
  DATABASE_HOST: z.string().default("localhost"),
  DATABASE_PORT: z.coerce.number().int().positive().default(3306),
  DATABASE_USER: z.string().default("cxnext"),
  DATABASE_PASSWORD: z.string().default("cxnext"),
  DATABASE_NAME: z.string().default("cxnext"),
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

export interface DatabaseConnection {
  readonly db: Kysely<DatabaseSchema>;
  destroy(): Promise<void>;
}

export function createDatabaseConnection(env: DatabaseEnv): DatabaseConnection {
  const poolOptions: PoolOptions = {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    connectionLimit: 10,
  };

  const pool = createPool(poolOptions);
  const db = new Kysely<DatabaseSchema>({
    dialect: new MysqlDialect({
      pool,
    }),
  });

  return {
    db,
    destroy: () => db.destroy(),
  };
}
