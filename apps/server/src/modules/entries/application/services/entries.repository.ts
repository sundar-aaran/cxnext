import type {
  BillingEntryKind,
  BillingEntryRecord,
  BillingItemRecord,
  MoneyEntryKind,
  MoneyEntryRecord,
  AllocationRecord,
} from "../../domain/entry-record";

export interface BillingItemInput extends Omit<
  BillingItemRecord,
  "id" | "parentId" | "lineSubtotal" | "lineTotal"
> {
  readonly id?: string;
}

export interface BillingEntryInput {
  readonly documentNo?: string | null;
  readonly documentDate?: string | Date | null;
  readonly partyId?: string | null;
  readonly partyName: string;
  readonly billingAddress?: string | null;
  readonly shippingAddress?: string | null;
  readonly placeOfSupply?: string | null;
  readonly priceListId?: string | null;
  readonly referenceNo?: string | null;
  readonly dueDate?: string | Date | null;
  readonly ewayBillNo?: string | null;
  readonly ewayBillDate?: string | Date | null;
  readonly supplierInvoiceNo?: string | null;
  readonly supplierInvoiceDate?: string | Date | null;
  readonly roundOff?: number;
  readonly status?: string;
  readonly paymentStatus?: string;
  readonly notes?: string | null;
  readonly terms?: string | null;
  readonly isActive?: boolean;
  readonly items?: readonly Partial<BillingItemInput>[];
}

export interface AllocationInput extends Omit<
  AllocationRecord,
  "id" | "parentId" | "balanceAfterAllocation"
> {
  readonly id?: string;
}

export interface MoneyEntryInput {
  readonly documentNo?: string | null;
  readonly documentDate?: string | Date | null;
  readonly partyId?: string | null;
  readonly partyName: string;
  readonly partyType?: string | null;
  readonly ledgerId?: string | null;
  readonly ledgerName?: string | null;
  readonly mode?: string;
  readonly bankAccountId?: string | null;
  readonly referenceNo?: string | null;
  readonly referenceDate?: string | Date | null;
  readonly amount?: number;
  readonly tdsAmount?: number;
  readonly discountAmount?: number;
  readonly roundOff?: number;
  readonly status?: string;
  readonly notes?: string | null;
  readonly isActive?: boolean;
  readonly allocations?: readonly Partial<AllocationInput>[];
}

export interface EntriesRepository {
  listBilling(kind: BillingEntryKind): Promise<readonly BillingEntryRecord[]>;
  getBilling(kind: BillingEntryKind, entryId: string): Promise<BillingEntryRecord | null>;
  createBilling(kind: BillingEntryKind, input: BillingEntryInput): Promise<BillingEntryRecord>;
  updateBilling(
    kind: BillingEntryKind,
    entryId: string,
    input: BillingEntryInput,
  ): Promise<BillingEntryRecord | null>;
  softDeleteBilling(kind: BillingEntryKind, entryId: string): Promise<boolean>;

  listMoney(kind: MoneyEntryKind): Promise<readonly MoneyEntryRecord[]>;
  getMoney(kind: MoneyEntryKind, entryId: string): Promise<MoneyEntryRecord | null>;
  createMoney(kind: MoneyEntryKind, input: MoneyEntryInput): Promise<MoneyEntryRecord>;
  updateMoney(
    kind: MoneyEntryKind,
    entryId: string,
    input: MoneyEntryInput,
  ): Promise<MoneyEntryRecord | null>;
  softDeleteMoney(kind: MoneyEntryKind, entryId: string): Promise<boolean>;
}

export const ENTRIES_REPOSITORY = Symbol("ENTRIES_REPOSITORY");
