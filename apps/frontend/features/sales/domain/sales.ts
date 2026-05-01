import type { MasterListColumnOption, MasterListFilterOption } from "@cxnext/ui";

export interface SalesItemInput {
  readonly productId: string | null;
  readonly productName: string;
  readonly productSku: string | null;
  readonly poNo: string | null;
  readonly dcNo: string | null;
  readonly description: string | null;
  readonly size: string | null;
  readonly colour: string | null;
  readonly areaSq: number;
  readonly hsnCodeId: string | null;
  readonly unitId: string | null;
  readonly quantity: number;
  readonly freeQuantity: number;
  readonly rate: number;
  readonly mrp: number;
  readonly discountType: string | null;
  readonly discountValue: number;
  readonly discountAmount: number;
  readonly taxId: string | null;
  readonly taxRate: number;
  readonly taxAmount: number;
  readonly sortOrder: number;
  readonly isActive: boolean;
}

export interface SalesLookupOption {
  readonly id: string;
  readonly label: string;
  readonly secondaryLabel: string | null;
}

export interface SalesRecord {
  readonly id: number;
  readonly documentNo: string;
  readonly documentDate: string;
  readonly partyId: string | null;
  readonly partyName: string;
  readonly billingAddress: string | null;
  readonly shippingAddress: string | null;
  readonly placeOfSupply: string | null;
  readonly referenceNo: string | null;
  readonly dueDate: string | null;
  readonly ewayBillNo: string | null;
  readonly ewayBillDate: string | null;
  readonly roundOff: number;
  readonly grandTotal: number;
  readonly balanceAmount: number;
  readonly status: string;
  readonly paymentStatus: string;
  readonly notes: string | null;
  readonly terms: string | null;
  readonly isActive: boolean;
  readonly updatedAt: string;
  readonly items: readonly SalesItemInput[];
}

export interface SalesInput {
  readonly documentNo: string;
  readonly documentDate: string;
  readonly partyId: string | null;
  readonly partyName: string;
  readonly billingAddress: string | null;
  readonly shippingAddress: string | null;
  readonly placeOfSupply: string | null;
  readonly referenceNo: string | null;
  readonly dueDate: string | null;
  readonly ewayBillNo: string | null;
  readonly ewayBillDate: string | null;
  readonly roundOff: number;
  readonly status: string;
  readonly paymentStatus: string;
  readonly notes: string | null;
  readonly terms: string | null;
  readonly isActive: boolean;
  readonly items: readonly SalesItemInput[];
}

export type SalesColumnId =
  | "documentNo"
  | "documentDate"
  | "party"
  | "status"
  | "paymentStatus"
  | "total"
  | "balance"
  | "updated";

export type SalesStatusFilter = "all" | "draft" | "posted" | "cancelled";
export type SalesColumnOption = MasterListColumnOption;
export type SalesIndustryKind = "offset" | "garment" | "upvc";

export function getSalesIndustryKind(industryName: string | null | undefined): SalesIndustryKind {
  const normalized = industryName?.toLowerCase() ?? "";
  if (normalized.includes("upvc") || normalized.includes("u pvc")) return "upvc";
  if (normalized.includes("garment") || normalized.includes("textile")) return "garment";
  return "offset";
}

export const salesColumnCatalog: readonly {
  readonly id: SalesColumnId;
  readonly label: string;
}[] = [
  { id: "documentNo", label: "Invoice" },
  { id: "documentDate", label: "Date" },
  { id: "party", label: "Customer" },
  { id: "status", label: "Status" },
  { id: "paymentStatus", label: "Payment" },
  { id: "total", label: "Total" },
  { id: "balance", label: "Balance" },
  { id: "updated", label: "Updated" },
];

export const defaultSalesColumnVisibility: Record<SalesColumnId, boolean> = {
  documentNo: true,
  documentDate: true,
  party: true,
  status: true,
  paymentStatus: true,
  total: true,
  balance: false,
  updated: false,
};

export const salesStatusFilters: readonly MasterListFilterOption[] = [
  { id: "all", label: "All sales" },
  { id: "draft", label: "draft" },
  { id: "posted", label: "posted" },
  { id: "cancelled", label: "cancelled" },
];

export function defaultSalesInput(): SalesInput {
  return {
    documentNo: "",
    documentDate: new Date().toISOString().slice(0, 10),
    partyId: null,
    partyName: "",
    billingAddress: null,
    shippingAddress: null,
    placeOfSupply: null,
    referenceNo: null,
    dueDate: null,
    ewayBillNo: null,
    ewayBillDate: null,
    roundOff: 0,
    status: "draft",
    paymentStatus: "unpaid",
    notes: null,
    terms: null,
    isActive: true,
    items: [defaultSalesItem()],
  };
}

export function defaultSalesItem(): SalesItemInput {
  return {
    productId: null,
    productName: "",
    productSku: null,
    poNo: null,
    dcNo: null,
    description: null,
    size: null,
    colour: null,
    areaSq: 0,
    hsnCodeId: null,
    unitId: null,
    quantity: 1,
    freeQuantity: 0,
    rate: 0,
    mrp: 0,
    discountType: null,
    discountValue: 0,
    discountAmount: 0,
    taxId: null,
    taxRate: 0,
    taxAmount: 0,
    sortOrder: 1,
    isActive: true,
  };
}
