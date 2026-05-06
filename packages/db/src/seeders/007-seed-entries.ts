import type { Kysely } from "kysely";
import { defineDatabaseSeeder } from "../process/types";

type DynamicDatabase = Record<string, Record<string, unknown>>;

const timestamp = "2026-04-30 12:00:00";

function asQueryDatabase(database: Kysely<unknown>) {
  return database as unknown as Kysely<DynamicDatabase>;
}

export const seedEntriesSeeder = defineDatabaseSeeder({
  id: "billing:entries:001-seed-basic-billing",
  appId: "billing",
  moduleKey: "entries",
  name: "Seed basic billing entries",
  order: 110,
  run: async ({ database }) => {
    const db = asQueryDatabase(database);
    await seedSale(db);
    await seedPurchase(db);
    await seedPayment(db);
    await seedReceipt(db);
  },
});

async function seedSale(db: Kysely<DynamicDatabase>) {
  const existing = await db
    .selectFrom("sales")
    .select("id")
    .where("invoice_no", "=", "SAL-0001")
    .executeTakeFirst();
  if (existing) return;
  const result = await db
    .insertInto("sales")
    .values({
      uuid: "seed-sale-0001",
      invoice_no: "SAL-0001",
      invoice_date: timestamp,
      customer_id: "contact:seed-contact-maya-rao",
      customer_name: "Sundar Kala Arunes Company Pvt Ltd",
      billing_address: "21 Lake View Road",
      shipping_address: "21 Lake View Road",
      place_of_supply: "Tamil Nadu",
      price_list_id: null,
      reference_no: "SO-REF-001",
      due_date: "2026-05-15 00:00:00",
      subtotal: 1890,
      discount_total: 0,
      taxable_total: 1890,
      tax_total: 340.2,
      round_off: -0.2,
      grand_total: 2230,
      paid_amount: 0,
      balance_amount: 2230,
      status: "draft",
      payment_status: "unpaid",
      notes: "Seed sales invoice.",
      terms: "Due on receipt.",
      is_active: true,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    })
    .executeTakeFirst();
  await db
    .insertInto("sales_items")
    .values({
      sale_id: Number(result.insertId),
      product_id: "product:aster-linen-shirt",
      product_name: "Aster Linen Shirt",
      product_sku: "ASTER-LINEN-SHIRT-001",
      description: "Seed sale line.",
      hsn_code_id: "hsn:default",
      unit_id: "unit:piece",
      quantity: 1,
      free_quantity: 0,
      rate: 1890,
      mrp: 2230,
      discount_type: null,
      discount_value: 0,
      discount_amount: 0,
      tax_id: "tax:gst-standard",
      tax_rate: 18,
      tax_amount: 340.2,
      line_subtotal: 1890,
      line_total: 2230.2,
      sort_order: 1,
      is_active: true,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .execute();
}

async function seedPurchase(db: Kysely<DynamicDatabase>) {
  const existing = await db
    .selectFrom("purchases")
    .select("id")
    .where("bill_no", "=", "PUR-0001")
    .executeTakeFirst();
  if (existing) return;
  const result = await db
    .insertInto("purchases")
    .values({
      uuid: "seed-purchase-0001",
      bill_no: "PUR-0001",
      bill_date: timestamp,
      supplier_id: "contact:seed-contact-swift-drop",
      supplier_name: "Swift Drop Logistics",
      supplier_invoice_no: "SUP-INV-001",
      supplier_invoice_date: timestamp,
      billing_address: "8 Logistics Hub",
      place_of_supply: "Karnataka",
      reference_no: "PO-REF-001",
      due_date: "2026-05-15 00:00:00",
      subtotal: 1490,
      discount_total: 0,
      taxable_total: 1490,
      tax_total: 268.2,
      round_off: -0.2,
      grand_total: 1758,
      paid_amount: 0,
      balance_amount: 1758,
      status: "draft",
      payment_status: "unpaid",
      notes: "Seed purchase bill.",
      terms: "Due on receipt.",
      is_active: true,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    })
    .executeTakeFirst();
  await db
    .insertInto("purchase_items")
    .values({
      purchase_id: Number(result.insertId),
      product_id: "product:luna-utility-tote",
      product_name: "Luna Utility Tote",
      product_sku: "LUNA-UTILITY-TOTE-01",
      description: "Seed purchase line.",
      hsn_code_id: "hsn:default",
      unit_id: "unit:piece",
      quantity: 1,
      free_quantity: 0,
      rate: 1490,
      mrp: 2490,
      discount_type: null,
      discount_value: 0,
      discount_amount: 0,
      tax_id: "tax:gst-standard",
      tax_rate: 18,
      tax_amount: 268.2,
      line_subtotal: 1490,
      line_total: 1758.2,
      sort_order: 1,
      is_active: true,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .execute();
}

async function seedPayment(db: Kysely<DynamicDatabase>) {
  const existing = await db
    .selectFrom("payments")
    .select("id")
    .where("payment_no", "=", "PAY-0001")
    .executeTakeFirst();
  if (existing) return;
  const result = await db
    .insertInto("payments")
    .values({
      uuid: "seed-payment-0001",
      payment_no: "PAY-0001",
      payment_date: timestamp,
      party_id: "contact:seed-contact-swift-drop",
      party_name: "Swift Drop Logistics",
      party_type: "supplier",
      ledger_id: "ledger-sundry-creditors",
      ledger_name: "Sundry Creditors",
      payment_mode: "bank",
      bank_account_id: "bank:primary",
      reference_no: "BANK-PAY-001",
      reference_date: timestamp,
      amount: 500,
      tds_amount: 0,
      discount_amount: 0,
      round_off: 0,
      net_amount: 500,
      allocated_amount: 500,
      unallocated_amount: 0,
      status: "draft",
      notes: "Seed supplier payment.",
      is_active: true,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    })
    .executeTakeFirst();
  await seedAllocation(
    db,
    "payment_allocations",
    "payment_id",
    Number(result.insertId),
    "purchase",
    "PUR-0001",
  );
}

async function seedReceipt(db: Kysely<DynamicDatabase>) {
  const existing = await db
    .selectFrom("receipts")
    .select("id")
    .where("receipt_no", "=", "REC-0001")
    .executeTakeFirst();
  if (existing) return;
  const result = await db
    .insertInto("receipts")
    .values({
      uuid: "seed-receipt-0001",
      receipt_no: "REC-0001",
      receipt_date: timestamp,
      party_id: "contact:seed-contact-maya-rao",
      party_name: "Sundar Kala Arunes Company Pvt Ltd",
      party_type: "customer",
      ledger_id: "ledger-sundry-debtors",
      ledger_name: "Sundry Debtors",
      receipt_mode: "cash",
      bank_account_id: null,
      reference_no: "CASH-REC-001",
      reference_date: timestamp,
      amount: 750,
      tds_amount: 0,
      discount_amount: 0,
      round_off: 0,
      net_amount: 750,
      allocated_amount: 750,
      unallocated_amount: 0,
      status: "draft",
      notes: "Seed customer receipt.",
      is_active: true,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    })
    .executeTakeFirst();
  await seedAllocation(
    db,
    "receipt_allocations",
    "receipt_id",
    Number(result.insertId),
    "sales",
    "SAL-0001",
  );
}

async function seedAllocation(
  db: Kysely<DynamicDatabase>,
  table: string,
  parentColumn: string,
  parentId: number,
  documentType: string,
  documentNo: string,
) {
  await db
    .insertInto(table)
    .values({
      [parentColumn]: parentId,
      document_type: documentType,
      document_id: documentNo,
      document_no: documentNo,
      document_date: timestamp,
      document_total: 1000,
      previous_balance: 1000,
      allocated_amount: 500,
      balance_after_allocation: 500,
      sort_order: 1,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .execute();
}
