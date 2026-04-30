import { describe, expect, it } from "vitest";
import { EntryAggregate } from "../../../apps/server/src/modules/entries/domain/aggregates/entry.aggregate";
import type {
  BillingEntryRecord,
  MoneyEntryRecord,
} from "../../../apps/server/src/modules/entries/domain/entry-record";

describe("EntryAggregate", () => {
  it("publishes singular sales and money event names", () => {
    expect(EntryAggregate.fromRecord(billingRecord()).createdEvent().eventName).toBe(
      "entries.sale-created",
    );
    expect(EntryAggregate.fromRecord(moneyRecord()).createdEvent().eventName).toBe(
      "entries.payment-created",
    );
  });

  it("publishes update and delete events with entry identity", () => {
    const updated = EntryAggregate.fromRecord(billingRecord()).updatedEvent();
    const deleted = EntryAggregate.deletedEvent("receipt", "7");

    expect(updated.aggregateId).toBe("5");
    expect(updated.eventName).toBe("entries.sale-updated");
    expect(deleted.aggregateId).toBe("7");
    expect(deleted.eventName).toBe("entries.receipt-deleted");
  });
});

function billingRecord(): BillingEntryRecord {
  const now = new Date("2026-04-30T00:00:00.000Z");

  return {
    id: "5",
    uuid: "sale-5",
    kind: "sales",
    documentNo: "S-001",
    documentDate: now,
    partyId: null,
    partyName: "Customer",
    billingAddress: null,
    shippingAddress: null,
    placeOfSupply: null,
    priceListId: null,
    referenceNo: null,
    dueDate: null,
    supplierInvoiceNo: null,
    supplierInvoiceDate: null,
    subtotal: 100,
    discountTotal: 0,
    taxableTotal: 100,
    taxTotal: 0,
    roundOff: 0,
    grandTotal: 100,
    paidAmount: 0,
    balanceAmount: 100,
    status: "draft",
    paymentStatus: "unpaid",
    notes: null,
    terms: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    items: [],
  };
}

function moneyRecord(): MoneyEntryRecord {
  const now = new Date("2026-04-30T00:00:00.000Z");

  return {
    id: "6",
    uuid: "payment-6",
    kind: "payment",
    documentNo: "PAY-001",
    documentDate: now,
    partyId: null,
    partyName: "Supplier",
    partyType: "supplier",
    ledgerId: null,
    ledgerName: "Cash",
    mode: "cash",
    bankAccountId: null,
    referenceNo: null,
    referenceDate: null,
    amount: 100,
    tdsAmount: 0,
    discountAmount: 0,
    roundOff: 0,
    netAmount: 100,
    allocatedAmount: 0,
    unallocatedAmount: 100,
    status: "draft",
    notes: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    allocations: [],
  };
}
