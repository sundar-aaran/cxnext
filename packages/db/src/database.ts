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

export interface ContactsTable {
  readonly id: Generated<number>;
  readonly uuid: string;
  readonly code: string;
  readonly contact_type_id: string | null;
  readonly ledger_id: string | null;
  readonly ledger_name: string | null;
  readonly name: string;
  readonly legal_name: string | null;
  readonly pan: string | null;
  readonly gstin: string | null;
  readonly msme_type: string | null;
  readonly msme_no: string | null;
  readonly opening_balance: ColumnType<number, number | string | undefined, number | string>;
  readonly balance_type: string | null;
  readonly credit_limit: ColumnType<number, number | string | undefined, number | string>;
  readonly website: string | null;
  readonly description: string | null;
  readonly primary_email: string | null;
  readonly primary_phone: string | null;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
  readonly deleted_at: NullableTimestampColumn;
}

export interface ContactAddressesTable {
  readonly id: Generated<number>;
  readonly contact_id: number;
  readonly address_type_id: string | null;
  readonly address_line1: string;
  readonly address_line2: string | null;
  readonly city_id: string | null;
  readonly district_id: string | null;
  readonly state_id: string | null;
  readonly country_id: string | null;
  readonly pincode_id: string | null;
  readonly latitude: ColumnType<
    number | null,
    number | string | null | undefined,
    number | string | null
  >;
  readonly longitude: ColumnType<
    number | null,
    number | string | null | undefined,
    number | string | null
  >;
  readonly is_default: Generated<boolean>;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
}

export interface ContactEmailsTable {
  readonly id: Generated<number>;
  readonly contact_id: number;
  readonly email: string;
  readonly email_type: string;
  readonly is_primary: Generated<boolean>;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
}

export interface ContactPhonesTable {
  readonly id: Generated<number>;
  readonly contact_id: number;
  readonly phone_number: string;
  readonly phone_type: string;
  readonly is_primary: Generated<boolean>;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
}

export interface ContactBankAccountsTable {
  readonly id: Generated<number>;
  readonly contact_id: number;
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

export interface ContactGstDetailsTable {
  readonly id: Generated<number>;
  readonly contact_id: number;
  readonly gstin: string;
  readonly state: string;
  readonly is_default: Generated<boolean>;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
}

type JsonColumn<T> = ColumnType<T, T | string | undefined, T | string>;

export interface ProductsTable {
  readonly id: Generated<number>;
  readonly uuid: string;
  readonly code: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly short_description: string | null;
  readonly brand_id: string | null;
  readonly brand_name: string | null;
  readonly category_id: string | null;
  readonly category_name: string | null;
  readonly product_group_id: string | null;
  readonly product_group_name: string | null;
  readonly product_type_id: string | null;
  readonly product_type_name: string | null;
  readonly unit_id: string | null;
  readonly hsn_code_id: string | null;
  readonly style_id: string | null;
  readonly sku: string;
  readonly has_variants: Generated<boolean>;
  readonly base_price: ColumnType<number, number | string | undefined, number | string>;
  readonly cost_price: ColumnType<number, number | string | undefined, number | string>;
  readonly tax_id: string | null;
  readonly is_featured: Generated<boolean>;
  readonly is_active: Generated<boolean>;
  readonly storefront_department: string | null;
  readonly home_slider_enabled: Generated<boolean>;
  readonly promo_slider_enabled: Generated<boolean>;
  readonly feature_section_enabled: Generated<boolean>;
  readonly discovery_board_enabled: Generated<boolean>;
  readonly discovery_board_order: Generated<number>;
  readonly visual_strip_enabled: Generated<boolean>;
  readonly visual_strip_order: Generated<number>;
  readonly is_new_arrival: Generated<boolean>;
  readonly is_best_seller: Generated<boolean>;
  readonly is_featured_label: Generated<boolean>;
  readonly primary_image_url: string | null;
  readonly variant_count: Generated<number>;
  readonly attribute_count: Generated<number>;
  readonly total_stock_quantity: ColumnType<number, number | string | undefined, number | string>;
  readonly tag_count: Generated<number>;
  readonly tag_names_json: JsonColumn<unknown>;
  readonly images_json: JsonColumn<unknown>;
  readonly variants_json: JsonColumn<unknown>;
  readonly prices_json: JsonColumn<unknown>;
  readonly discounts_json: JsonColumn<unknown>;
  readonly offers_json: JsonColumn<unknown>;
  readonly attributes_json: JsonColumn<unknown>;
  readonly attribute_values_json: JsonColumn<unknown>;
  readonly variant_map_json: JsonColumn<unknown>;
  readonly stock_items_json: JsonColumn<unknown>;
  readonly stock_movements_json: JsonColumn<unknown>;
  readonly seo_json: JsonColumn<unknown>;
  readonly storefront_json: JsonColumn<unknown>;
  readonly tags_json: JsonColumn<unknown>;
  readonly reviews_json: JsonColumn<unknown>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
  readonly deleted_at: NullableTimestampColumn;
}

interface BillingEntryTable {
  readonly id: Generated<number>;
  readonly uuid: string;
  readonly billing_address: string | null;
  readonly place_of_supply: string | null;
  readonly reference_no: string | null;
  readonly due_date: NullableTimestampColumn;
  readonly subtotal: ColumnType<number, number | string | undefined, number | string>;
  readonly discount_total: ColumnType<number, number | string | undefined, number | string>;
  readonly taxable_total: ColumnType<number, number | string | undefined, number | string>;
  readonly tax_total: ColumnType<number, number | string | undefined, number | string>;
  readonly round_off: ColumnType<number, number | string | undefined, number | string>;
  readonly grand_total: ColumnType<number, number | string | undefined, number | string>;
  readonly paid_amount: ColumnType<number, number | string | undefined, number | string>;
  readonly balance_amount: ColumnType<number, number | string | undefined, number | string>;
  readonly status: string;
  readonly payment_status: string;
  readonly notes: string | null;
  readonly terms: string | null;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
  readonly deleted_at: NullableTimestampColumn;
}

export interface SalesTable extends BillingEntryTable {
  readonly invoice_no: string;
  readonly invoice_date: TimestampColumn;
  readonly customer_id: string | null;
  readonly customer_name: string;
  readonly shipping_address: string | null;
  readonly price_list_id: string | null;
  readonly eway_bill_no: string | null;
  readonly eway_bill_date: NullableTimestampColumn;
}

export interface PurchasesTable extends BillingEntryTable {
  readonly bill_no: string;
  readonly bill_date: TimestampColumn;
  readonly supplier_id: string | null;
  readonly supplier_name: string;
  readonly supplier_invoice_no: string | null;
  readonly supplier_invoice_date: NullableTimestampColumn;
}

interface BillingItemTable {
  readonly id: Generated<number>;
  readonly product_id: string | null;
  readonly product_name: string;
  readonly product_sku: string | null;
  readonly po_no: string | null;
  readonly dc_no: string | null;
  readonly description: string | null;
  readonly size: string | null;
  readonly colour: string | null;
  readonly area_sq: ColumnType<number, number | string | undefined, number | string>;
  readonly hsn_code_id: string | null;
  readonly unit_id: string | null;
  readonly quantity: ColumnType<number, number | string | undefined, number | string>;
  readonly free_quantity: ColumnType<number, number | string | undefined, number | string>;
  readonly rate: ColumnType<number, number | string | undefined, number | string>;
  readonly mrp: ColumnType<number, number | string | undefined, number | string>;
  readonly discount_type: string | null;
  readonly discount_value: ColumnType<number, number | string | undefined, number | string>;
  readonly discount_amount: ColumnType<number, number | string | undefined, number | string>;
  readonly tax_id: string | null;
  readonly tax_rate: ColumnType<number, number | string | undefined, number | string>;
  readonly tax_amount: ColumnType<number, number | string | undefined, number | string>;
  readonly line_subtotal: ColumnType<number, number | string | undefined, number | string>;
  readonly line_total: ColumnType<number, number | string | undefined, number | string>;
  readonly sort_order: Generated<number>;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
}

export interface SalesItemsTable extends BillingItemTable {
  readonly sale_id: number;
}

export interface PurchaseItemsTable extends BillingItemTable {
  readonly purchase_id: number;
}

interface MoneyEntryTable {
  readonly id: Generated<number>;
  readonly uuid: string;
  readonly party_id: string | null;
  readonly party_name: string;
  readonly party_type: string | null;
  readonly ledger_id: string | null;
  readonly ledger_name: string | null;
  readonly bank_account_id: string | null;
  readonly reference_no: string | null;
  readonly reference_date: NullableTimestampColumn;
  readonly amount: ColumnType<number, number | string | undefined, number | string>;
  readonly tds_amount: ColumnType<number, number | string | undefined, number | string>;
  readonly discount_amount: ColumnType<number, number | string | undefined, number | string>;
  readonly round_off: ColumnType<number, number | string | undefined, number | string>;
  readonly net_amount: ColumnType<number, number | string | undefined, number | string>;
  readonly allocated_amount: ColumnType<number, number | string | undefined, number | string>;
  readonly unallocated_amount: ColumnType<number, number | string | undefined, number | string>;
  readonly status: string;
  readonly notes: string | null;
  readonly is_active: Generated<boolean>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
  readonly deleted_at: NullableTimestampColumn;
}

export interface PaymentsTable extends MoneyEntryTable {
  readonly payment_no: string;
  readonly payment_date: TimestampColumn;
  readonly payment_mode: string;
}

export interface ReceiptsTable extends MoneyEntryTable {
  readonly receipt_no: string;
  readonly receipt_date: TimestampColumn;
  readonly receipt_mode: string;
}

interface AllocationTable {
  readonly id: Generated<number>;
  readonly document_type: string;
  readonly document_id: string | null;
  readonly document_no: string;
  readonly document_date: NullableTimestampColumn;
  readonly document_total: ColumnType<number, number | string | undefined, number | string>;
  readonly previous_balance: ColumnType<number, number | string | undefined, number | string>;
  readonly allocated_amount: ColumnType<number, number | string | undefined, number | string>;
  readonly balance_after_allocation: ColumnType<
    number,
    number | string | undefined,
    number | string
  >;
  readonly sort_order: Generated<number>;
  readonly created_at: TimestampColumn;
  readonly updated_at: TimestampColumn;
}

export interface PaymentAllocationsTable extends AllocationTable {
  readonly payment_id: number;
}

export interface ReceiptAllocationsTable extends AllocationTable {
  readonly receipt_id: number;
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
  readonly contact_addresses: ContactAddressesTable;
  readonly contact_bank_accounts: ContactBankAccountsTable;
  readonly contact_emails: ContactEmailsTable;
  readonly contact_gst_details: ContactGstDetailsTable;
  readonly contact_phones: ContactPhonesTable;
  readonly contacts: ContactsTable;
  readonly common_cities: CommonCitiesTable;
  readonly common_countries: CommonCountriesTable;
  readonly common_districts: CommonDistrictsTable;
  readonly common_pincodes: CommonPincodesTable;
  readonly common_states: CommonStatesTable;
  readonly industries: IndustriesTable;
  readonly payment_allocations: PaymentAllocationsTable;
  readonly payments: PaymentsTable;
  readonly products: ProductsTable;
  readonly purchase_items: PurchaseItemsTable;
  readonly purchases: PurchasesTable;
  readonly receipt_allocations: ReceiptAllocationsTable;
  readonly receipts: ReceiptsTable;
  readonly sales: SalesTable;
  readonly sales_items: SalesItemsTable;
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
