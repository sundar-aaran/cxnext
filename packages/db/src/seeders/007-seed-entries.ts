import type { Kysely } from "kysely";
import { defineDatabaseSeeder } from "../process/types";

type DynamicDatabase = Record<string, Record<string, unknown>>;
type BillingSeed = {
  readonly address: string;
  readonly date: string;
  readonly documentNo: string;
  readonly dueDate: string;
  readonly item: string;
  readonly partyId: string;
  readonly partyName: string;
  readonly productId: string;
  readonly productSku: string;
  readonly quantity: number;
  readonly rate: number;
  readonly referenceNo: string;
  readonly supplierInvoiceNo?: string;
};
type MoneySeed = {
  readonly amount: number;
  readonly date: string;
  readonly documentNo: string;
  readonly partyId: string;
  readonly partyName: string;
  readonly referenceNo: string;
};
type SeedParty = {
  readonly address: string;
  readonly id: string;
  readonly name: string;
};

const timestamp = "2026-04-30 12:00:00";
const customerParties = [
  { id: "contact:seed-contact-maya-rao", name: "Sundar Kala Arunes Company Pvt Ltd", address: "21 Lake View Road" },
  { id: "contact:customer-aster", name: "Aster Retail House", address: "18 Market Street" },
  { id: "contact:customer-urban", name: "Urban Weaves Studio", address: "44 Textile Avenue" },
] as const;
const supplierParties = [
  { id: "contact:seed-contact-swift-drop", name: "Swift Drop Logistics", address: "8 Logistics Hub" },
  { id: "contact:supplier-fabric", name: "Prime Fabric Mills", address: "12 Mill Compound" },
  { id: "contact:supplier-pack", name: "North Star Packaging", address: "5 Industrial Estate" },
] as const;
const products = [
  { id: "product:aster-linen-shirt", name: "Aster Linen Shirt", sku: "ASTER-LINEN-SHIRT-001", rate: 1890 },
  { id: "product:luna-utility-tote", name: "Luna Utility Tote", sku: "LUNA-UTILITY-TOTE-01", rate: 1490 },
  { id: "product:cotton-roll", name: "Cotton Roll", sku: "COTTON-ROLL-01", rate: 920 },
] as const;

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
    await seedSales(db);
    await seedPurchases(db);
    await seedPayments(db);
    await seedReceipts(db);
  },
});

async function seedSales(db: Kysely<DynamicDatabase>) {
  for (const seed of billingSeeds("SAL", customerParties)) {
    if (await exists(db, "sales", "invoice_no", seed.documentNo)) continue;
    const totals = billingTotals(seed);
    const result = await db
      .insertInto("sales")
      .values({
        uuid: `seed-sale-${seed.documentNo.toLowerCase()}`,
        invoice_no: seed.documentNo,
        invoice_date: seed.date,
        customer_id: seed.partyId,
        customer_name: seed.partyName,
        billing_address: seed.address,
        shipping_address: seed.address,
        place_of_supply: "cgst-sgst",
        price_list_id: null,
        reference_no: seed.referenceNo,
        due_date: seed.dueDate,
        subtotal: totals.subtotal,
        discount_total: 0,
        taxable_total: totals.subtotal,
        tax_total: totals.tax,
        round_off: totals.roundOff,
        grand_total: totals.grandTotal,
        paid_amount: 0,
        balance_amount: totals.grandTotal,
        status: "posted",
        payment_status: "unpaid",
        notes: "Seed sales invoice.",
        terms: "Due on receipt.",
        is_active: true,
        created_at: timestamp,
        updated_at: timestamp,
        deleted_at: null,
      })
      .executeTakeFirst();
    await insertBillingItem(db, "sales_items", "sale_id", Number(result.insertId), seed, totals);
  }
}

async function seedPurchases(db: Kysely<DynamicDatabase>) {
  for (const seed of billingSeeds("PUR", supplierParties)) {
    if (await exists(db, "purchases", "bill_no", seed.documentNo)) continue;
    const totals = billingTotals(seed);
    const result = await db
      .insertInto("purchases")
      .values({
        uuid: `seed-purchase-${seed.documentNo.toLowerCase()}`,
        bill_no: seed.documentNo,
        bill_date: seed.date,
        supplier_id: seed.partyId,
        supplier_name: seed.partyName,
        supplier_invoice_no: seed.supplierInvoiceNo,
        supplier_invoice_date: seed.date,
        billing_address: seed.address,
        place_of_supply: "cgst-sgst",
        reference_no: seed.referenceNo,
        due_date: seed.dueDate,
        subtotal: totals.subtotal,
        discount_total: 0,
        taxable_total: totals.subtotal,
        tax_total: totals.tax,
        round_off: totals.roundOff,
        grand_total: totals.grandTotal,
        paid_amount: 0,
        balance_amount: totals.grandTotal,
        status: "posted",
        payment_status: "unpaid",
        notes: "Seed purchase bill.",
        terms: "Due on receipt.",
        is_active: true,
        created_at: timestamp,
        updated_at: timestamp,
        deleted_at: null,
      })
      .executeTakeFirst();
    await insertBillingItem(db, "purchase_items", "purchase_id", Number(result.insertId), seed, totals);
  }
}

async function seedPayments(db: Kysely<DynamicDatabase>) {
  for (const seed of moneySeeds("PAY", supplierParties)) {
    if (await exists(db, "payments", "payment_no", seed.documentNo)) continue;
    const result = await db
      .insertInto("payments")
      .values({
        uuid: `seed-payment-${seed.documentNo.toLowerCase()}`,
        payment_no: seed.documentNo,
        payment_date: seed.date,
        party_id: seed.partyId,
        party_name: seed.partyName,
        party_type: "supplier",
        ledger_id: "ledger-sundry-creditors",
        ledger_name: "Sundry Creditors",
        payment_mode: modeFor(seed.documentNo),
        bank_account_id: "bank:primary",
        reference_no: seed.referenceNo,
        reference_date: seed.date,
        amount: seed.amount,
        tds_amount: 0,
        discount_amount: 0,
        round_off: 0,
        net_amount: seed.amount,
        allocated_amount: seed.amount,
        unallocated_amount: 0,
        status: "posted",
        notes: "Seed supplier payment.",
        is_active: true,
        created_at: timestamp,
        updated_at: timestamp,
        deleted_at: null,
      })
      .executeTakeFirst();
    await seedAllocation(db, "payment_allocations", "payment_id", Number(result.insertId), "purchase", linkedDocument("PUR", seed.documentNo), seed);
  }
}

async function seedReceipts(db: Kysely<DynamicDatabase>) {
  for (const seed of moneySeeds("REC", customerParties)) {
    if (await exists(db, "receipts", "receipt_no", seed.documentNo)) continue;
    const result = await db
      .insertInto("receipts")
      .values({
        uuid: `seed-receipt-${seed.documentNo.toLowerCase()}`,
        receipt_no: seed.documentNo,
        receipt_date: seed.date,
        party_id: seed.partyId,
        party_name: seed.partyName,
        party_type: "customer",
        ledger_id: "ledger-sundry-debtors",
        ledger_name: "Sundry Debtors",
        receipt_mode: modeFor(seed.documentNo),
        bank_account_id: seed.documentNo.endsWith("001") ? null : "bank:primary",
        reference_no: seed.referenceNo,
        reference_date: seed.date,
        amount: seed.amount,
        tds_amount: 0,
        discount_amount: 0,
        round_off: 0,
        net_amount: seed.amount,
        allocated_amount: seed.amount,
        unallocated_amount: 0,
        status: "posted",
        notes: "Seed customer receipt.",
        is_active: true,
        created_at: timestamp,
        updated_at: timestamp,
        deleted_at: null,
      })
      .executeTakeFirst();
    await seedAllocation(db, "receipt_allocations", "receipt_id", Number(result.insertId), "sales", linkedDocument("SAL", seed.documentNo), seed);
  }
}

async function insertBillingItem(
  db: Kysely<DynamicDatabase>,
  table: string,
  parentColumn: string,
  parentId: number,
  seed: BillingSeed,
  totals: ReturnType<typeof billingTotals>,
) {
  await db
    .insertInto(table)
    .values({
      [parentColumn]: parentId,
      product_id: seed.productId,
      product_name: seed.item,
      product_sku: seed.productSku,
      po_no: seed.referenceNo,
      dc_no: null,
      description: "Seed line.",
      size: "M",
      colour: "Blue",
      area_sq: 0,
      hsn_code_id: "hsn:default",
      unit_id: "unit:piece",
      quantity: seed.quantity,
      free_quantity: 0,
      rate: seed.rate,
      mrp: seed.rate,
      discount_type: null,
      discount_value: 0,
      discount_amount: 0,
      tax_id: "tax:gst-standard",
      tax_rate: 18,
      tax_amount: totals.tax,
      line_subtotal: totals.subtotal,
      line_total: totals.subtotal + totals.tax,
      sort_order: 1,
      is_active: true,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .execute();
}

async function seedAllocation(
  db: Kysely<DynamicDatabase>,
  table: string,
  parentColumn: string,
  parentId: number,
  documentType: string,
  documentNo: string,
  seed: MoneySeed,
) {
  await db
    .insertInto(table)
    .values({
      [parentColumn]: parentId,
      document_type: documentType,
      document_id: documentNo,
      document_no: documentNo,
      document_date: seed.date,
      document_total: seed.amount * 1.4,
      previous_balance: seed.amount * 1.4,
      allocated_amount: seed.amount,
      balance_after_allocation: seed.amount * 0.4,
      sort_order: 1,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .execute();
}

function billingSeeds(prefix: "PUR" | "SAL", parties: readonly SeedParty[]) {
  return Array.from({ length: 18 }, (_, index): BillingSeed => {
    const serial = index + 1;
    const party = parties[index % parties.length];
    const product = products[index % products.length];
    const date = dateFor(index, 0);
    return {
      address: party.address,
      date,
      documentNo: `${prefix}-${String(serial).padStart(4, "0")}`,
      dueDate: dateFor(index, 18),
      item: product.name,
      partyId: party.id,
      partyName: party.name,
      productId: product.id,
      productSku: product.sku,
      quantity: 1 + (index % 5),
      rate: product.rate + (index % 4) * 75,
      referenceNo: `${prefix === "SAL" ? "SO" : "PO"}-REF-${String(serial).padStart(3, "0")}`,
      supplierInvoiceNo: prefix === "PUR" ? `SUP-INV-${String(serial).padStart(3, "0")}` : undefined,
    };
  });
}

function moneySeeds(prefix: "PAY" | "REC", parties: readonly SeedParty[]) {
  return Array.from({ length: 18 }, (_, index): MoneySeed => {
    const serial = index + 1;
    const party = parties[index % parties.length];
    return {
      amount: 500 + (index % 6) * 275,
      date: dateFor(index, 5),
      documentNo: `${prefix}-${String(serial).padStart(4, "0")}`,
      partyId: party.id,
      partyName: party.name,
      referenceNo: `${prefix}-BANK-${String(serial).padStart(3, "0")}`,
    };
  });
}

function billingTotals(seed: BillingSeed) {
  const subtotal = seed.quantity * seed.rate;
  const tax = Number((subtotal * 0.18).toFixed(2));
  const beforeRound = subtotal + tax;
  const grandTotal = Math.round(beforeRound);
  return { grandTotal, roundOff: Number((grandTotal - beforeRound).toFixed(2)), subtotal, tax };
}

function dateFor(index: number, offsetDays: number) {
  const date = new Date(Date.UTC(2026, 3, 1 + index * 2 + offsetDays));
  return `${date.toISOString().slice(0, 10)} 00:00:00`;
}

function linkedDocument(prefix: "PUR" | "SAL", documentNo: string) {
  return `${prefix}-${documentNo.slice(-4)}`;
}

function modeFor(documentNo: string) {
  const modes = ["cash", "rtgs-transfer", "neft-transfer", "upi-transfer"];
  return modes[Number(documentNo.slice(-2)) % modes.length];
}

async function exists(db: Kysely<DynamicDatabase>, table: string, column: string, value: string) {
  return Boolean(
    await db.selectFrom(table).select("id").where(column, "=", value).executeTakeFirst(),
  );
}
