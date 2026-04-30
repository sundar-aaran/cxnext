import type { MasterListColumnOption, MasterListFilterOption } from "@cxnext/ui";

export interface PurchaseItemInput {
  readonly productName: string;
  readonly productId: string | null;
  readonly productSku: string | null;
  readonly quantity: number;
  readonly rate: number;
  readonly taxRate: number;
  readonly freeQuantity: number;
  readonly mrp: number;
  readonly discountType: string | null;
  readonly discountValue: number;
  readonly discountAmount: number;
  readonly taxId: string | null;
  readonly taxAmount: number;
  readonly hsnCodeId: string | null;
  readonly unitId: string | null;
  readonly description: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
}

export interface PurchaseRecord {
  readonly id: number;
  readonly documentNo: string;
  readonly documentDate: string;
  readonly partyName: string;
  readonly partyId: string | null;
  readonly supplierInvoiceNo: string | null;
  readonly supplierInvoiceDate: string | null;
  readonly billingAddress: string | null;
  readonly placeOfSupply: string | null;
  readonly referenceNo: string | null;
  readonly dueDate: string | null;
  readonly grandTotal: number;
  readonly balanceAmount: number;
  readonly status: string;
  readonly paymentStatus: string;
  readonly notes: string | null;
  readonly terms: string | null;
  readonly isActive: boolean;
  readonly updatedAt: string;
  readonly items: readonly PurchaseItemInput[];
}

export interface PurchaseInput {
  readonly documentNo: string;
  readonly documentDate: string;
  readonly partyName: string;
  readonly partyId: string | null;
  readonly supplierInvoiceNo: string | null;
  readonly supplierInvoiceDate: string | null;
  readonly billingAddress: string | null;
  readonly placeOfSupply: string | null;
  readonly referenceNo: string | null;
  readonly dueDate: string | null;
  readonly status: string;
  readonly paymentStatus: string;
  readonly notes: string | null;
  readonly terms: string | null;
  readonly isActive: boolean;
  readonly items: readonly PurchaseItemInput[];
}

export type PurchaseColumnId =
  | "documentNo"
  | "documentDate"
  | "party"
  | "supplierInvoice"
  | "status"
  | "paymentStatus"
  | "total"
  | "balance"
  | "updated";

export type PurchaseStatusFilter = "all" | "draft" | "posted" | "cancelled";
export type PurchaseColumnOption = MasterListColumnOption;

export const purchaseColumnCatalog: readonly {
  readonly id: PurchaseColumnId;
  readonly label: string;
}[] = [
  { id: "documentNo", label: "Bill" },
  { id: "documentDate", label: "Date" },
  { id: "party", label: "Supplier" },
  { id: "supplierInvoice", label: "Supplier invoice" },
  { id: "status", label: "Status" },
  { id: "paymentStatus", label: "Payment" },
  { id: "total", label: "Total" },
  { id: "balance", label: "Balance" },
  { id: "updated", label: "Updated" },
];

export const defaultPurchaseColumnVisibility: Record<PurchaseColumnId, boolean> = {
  documentNo: true,
  documentDate: true,
  party: true,
  supplierInvoice: true,
  status: true,
  paymentStatus: true,
  total: true,
  balance: false,
  updated: false,
};

export const purchaseStatusFilters: readonly MasterListFilterOption[] = [
  { id: "all", label: "All purchases" },
  { id: "draft", label: "draft" },
  { id: "posted", label: "posted" },
  { id: "cancelled", label: "cancelled" },
];

export function defaultPurchaseItem(): PurchaseItemInput {
  return {
    productName: "",
    productId: null,
    productSku: null,
    quantity: 1,
    rate: 0,
    taxRate: 0,
    freeQuantity: 0,
    mrp: 0,
    discountType: null,
    discountValue: 0,
    discountAmount: 0,
    taxId: null,
    taxAmount: 0,
    hsnCodeId: null,
    unitId: null,
    description: null,
    sortOrder: 1,
    isActive: true,
  };
}

export function defaultPurchaseInput(): PurchaseInput {
  return {
    documentNo: "",
    documentDate: new Date().toISOString().slice(0, 10),
    partyName: "",
    partyId: null,
    supplierInvoiceNo: null,
    supplierInvoiceDate: null,
    billingAddress: null,
    placeOfSupply: null,
    referenceNo: null,
    dueDate: null,
    status: "draft",
    paymentStatus: "unpaid",
    notes: null,
    terms: null,
    isActive: true,
    items: [defaultPurchaseItem()],
  };
}
