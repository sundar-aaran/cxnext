"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Plus, Printer, X } from "lucide-react";
import { toast } from "sonner";
import {
  AnimatedTabs,
  Button,
  Input,
  MasterListEmptyState,
  MasterListPageFrame,
  MasterListPaginationCard,
  MasterListShowCard,
  MasterListTableCard,
  MasterListToolbarCard,
  MasterListUpsertCard,
  MasterListUpsertLayout,
  RowActionMenu,
  SavePrintButtons,
  Separator,
  buildMasterListShowingLabel,
} from "@cxnext/ui";
import {
  buildReceiptColumnOptions,
  deleteReceipt,
  filterReceipts,
  formatEntryDate,
  formatMoney,
  getReceipt,
  listReceipts,
  prepareReceiptInput,
  upsertReceipt,
} from "../../application/receipt-service";
import {
  defaultReceiptAllocation,
  defaultReceiptInput,
  defaultReceiptColumnVisibility,
  receiptStatusFilters,
  type ReceiptColumnId,
  type ReceiptInput,
  type ReceiptRecord,
  type ReceiptStatusFilter,
} from "../../domain/receipt";

export function ReceiptListPage() {
  const [records, setRecords] = useState<readonly ReceiptRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReceiptStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [visibleColumns, setVisibleColumns] = useState<Record<ReceiptColumnId, boolean>>(
    defaultReceiptColumnVisibility,
  );

  useEffect(() => void listReceipts().then(setRecords), []);

  const filtered = useMemo(
    () =>
      filterReceipts(records, search, statusFilter).sort((left, right) =>
        left.documentNo.localeCompare(right.documentNo),
      ),
    [records, search, statusFilter],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageRecords = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const columnOptions = useMemo(
    () =>
      buildReceiptColumnOptions({
        visibleColumns,
        onToggle: (columnId, checked) =>
          setVisibleColumns((currentValue) => ({ ...currentValue, [columnId]: checked })),
      }),
    [visibleColumns],
  );

  async function remove(record: ReceiptRecord) {
    try {
      await deleteReceipt(record.id);
      setRecords((currentRecords) => currentRecords.filter((item) => item.id !== record.id));
      toast.success("Receipt deleted");
    } catch (error) {
      toast.error("Could not delete receipt", { description: getErrorMessage(error) });
    }
  }

  async function restore(record: ReceiptRecord) {
    try {
      const restored = await upsertReceipt(
        prepareReceiptInput({
          ...defaultReceiptInput(),
          ...record,
          documentDate: record.documentDate.slice(0, 10),
          referenceDate: record.referenceDate ? record.referenceDate.slice(0, 10) : null,
          isActive: true,
        }),
        record.id,
      );
      setRecords((currentRecords) =>
        currentRecords.map((item) => (item.id === restored.id ? restored : item)),
      );
      toast.success("Receipt restored");
    } catch (error) {
      toast.error("Could not restore receipt", { description: getErrorMessage(error) });
    }
  }

  return (
    <MasterListPageFrame
      action={
        <Button asChild className="rounded-xl">
          <Link href="/desk/receipt/new">
            <Plus className="size-4" />
            New Receipt
          </Link>
        </Button>
      }
      description="Track customer receipts and sales allocations."
      technicalName="page.entries.receipt.list"
      title="Receipt"
    >
      <MasterListToolbarCard
        columns={columnOptions}
        filterOptions={receiptStatusFilters}
        filterValue={statusFilter}
        onFilterValueChange={(nextValue) => {
          setStatusFilter(nextValue as ReceiptStatusFilter);
          setCurrentPage(1);
        }}
        onSearchValueChange={(nextValue) => {
          setSearch(nextValue);
          setCurrentPage(1);
        }}
        onShowAllColumns={() => setVisibleColumns(defaultReceiptColumnVisibility)}
        searchPlaceholder="Search receipt, customer, mode, ledger, reference, or status"
        searchValue={search}
      />
      <MasterListTableCard className="rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-sm">
            <thead className="bg-muted/55">
              <tr>
                {visibleColumns.documentNo ? <ListHeader>Receipt</ListHeader> : null}
                {visibleColumns.documentDate ? <ListHeader>Date</ListHeader> : null}
                {visibleColumns.party ? <ListHeader>Customer</ListHeader> : null}
                {visibleColumns.mode ? <ListHeader>Mode</ListHeader> : null}
                {visibleColumns.ledger ? <ListHeader>Ledger</ListHeader> : null}
                {visibleColumns.status ? <ListHeader>Status</ListHeader> : null}
                {visibleColumns.amount ? <ListHeader align="right">Amount</ListHeader> : null}
                {visibleColumns.unallocated ? (
                  <ListHeader align="right">Unallocated</ListHeader>
                ) : null}
                {visibleColumns.updated ? <ListHeader>Updated</ListHeader> : null}
                <ListHeader align="right">Action</ListHeader>
              </tr>
            </thead>
            <tbody>
              {pageRecords.map((record) => (
                <tr key={record.id} className="border-b border-border/60 last:border-b-0">
                  {visibleColumns.documentNo ? (
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/desk/receipt/${record.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {record.documentNo}
                      </Link>
                    </td>
                  ) : null}
                  {visibleColumns.documentDate ? (
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {formatEntryDate(record.documentDate)}
                    </td>
                  ) : null}
                  {visibleColumns.party ? (
                    <td className="px-4 py-2.5">{record.partyName}</td>
                  ) : null}
                  {visibleColumns.mode ? (
                    <td className="px-4 py-2.5 text-muted-foreground">{record.mode}</td>
                  ) : null}
                  {visibleColumns.ledger ? (
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {record.ledgerName ?? "-"}
                    </td>
                  ) : null}
                  {visibleColumns.status ? <td className="px-4 py-2.5">{record.status}</td> : null}
                  {visibleColumns.amount ? (
                    <td className="px-4 py-2.5 text-right">{formatMoney(record.netAmount)}</td>
                  ) : null}
                  {visibleColumns.unallocated ? (
                    <td className="px-4 py-2.5 text-right">
                      {formatMoney(record.unallocatedAmount)}
                    </td>
                  ) : null}
                  {visibleColumns.updated ? (
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {formatEntryDate(record.updatedAt)}
                    </td>
                  ) : null}
                  <td className="px-4 py-2 text-right">
                    <RowActionMenu
                      editHref={`/desk/receipt/${record.id}/edit`}
                      isActive={record.isActive}
                      viewHref={`/desk/receipt/${record.id}`}
                      onDelete={() => void remove(record)}
                      onRestore={() => void restore(record)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageRecords.length === 0 ? (
          <MasterListEmptyState>No receipts found.</MasterListEmptyState>
        ) : null}
      </MasterListTableCard>
      <MasterListPaginationCard
        page={currentPage}
        rowsPerPage={rowsPerPage}
        showingLabel={buildMasterListShowingLabel({
          page: currentPage,
          pageSize: rowsPerPage,
          totalCount: filtered.length,
        })}
        singularLabel="receipts"
        totalCount={filtered.length}
        totalPages={totalPages}
        onPageChange={(nextPage) => setCurrentPage(nextPage)}
        onNextPage={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        onPreviousPage={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onRowsPerPageChange={(nextValue) => {
          setRowsPerPage(nextValue);
          setCurrentPage(1);
        }}
      />
    </MasterListPageFrame>
  );
}

export function ReceiptShowPage({ receiptId }: { readonly receiptId: number }) {
  const [record, setRecord] = useState<ReceiptRecord | null>(null);

  useEffect(() => void getReceipt(receiptId).then(setRecord), [receiptId]);

  return (
    <MasterListPageFrame
      action={
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-xl">
            <Link href={`/desk/receipt/${receiptId}/edit`}>Edit</Link>
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print
          </Button>
        </div>
      }
      description={record?.partyName ?? "Loading receipt."}
      technicalName="page.entries.receipt.show"
      title={record?.documentNo ?? "Receipt"}
    >
      <MasterListShowCard className={entryShowCardClassName} title="Summary">
        {record
          ? `${formatMoney(record.netAmount)} received / ${formatMoney(record.unallocatedAmount)} unallocated`
          : "Loading."}
      </MasterListShowCard>
    </MasterListPageFrame>
  );
}

export function ReceiptUpsertPage({ receiptId }: { readonly receiptId?: number }) {
  const router = useRouter();
  const [form, setForm] = useState<ReceiptInput>(defaultReceiptInput());

  useEffect(() => {
    if (!receiptId) return;
    void getReceipt(receiptId).then((record) => {
      if (record)
        setForm({
          ...defaultReceiptInput(),
          ...record,
          documentDate: record.documentDate.slice(0, 10),
        });
    });
  }, [receiptId]);

  async function save(printAfterSave = false) {
    const record = await upsertReceipt(prepareReceiptInput(form), receiptId);
    toast.success(receiptId ? "Receipt updated" : "Receipt created");
    if (printAfterSave) {
      window.print();
    }
    router.push(`/desk/receipt/${record.id}`);
  }

  return (
    <MasterListPageFrame
      action={
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={receiptId ? `/desk/receipt/${receiptId}` : "/desk/receipt"}>
            <X className="size-4" />
            Cancel
          </Link>
        </Button>
      }
      description="Basic incoming receipt entry."
      technicalName="page.entries.receipt.upsert"
      title={receiptId ? "Edit receipt" : "New receipt"}
    >
      <MasterListUpsertLayout>
        <MasterListUpsertCard>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <AnimatedTabs
              tabs={[
                {
                  value: "details",
                  label: "Details",
                  content: <ReceiptDetailsTab form={form} setForm={setForm} />,
                },
                {
                  value: "allocations",
                  label: "Allocations",
                  content: <ReceiptAllocationsTab form={form} setForm={setForm} />,
                },
              ]}
            />
            <Separator />
            <SavePrintButtons saveLabel="Save receipt" onSavePrint={() => void save(true)} />
          </form>
        </MasterListUpsertCard>
      </MasterListUpsertLayout>
    </MasterListPageFrame>
  );
}

function ReceiptDetailsTab({
  form,
  setForm,
}: {
  readonly form: ReceiptInput;
  readonly setForm: (value: ReceiptInput) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Input
        value={form.documentNo}
        placeholder="Receipt no"
        onChange={(event) => setForm({ ...form, documentNo: event.target.value })}
      />
      <Input
        type="date"
        value={form.documentDate}
        onChange={(event) => setForm({ ...form, documentDate: event.target.value })}
      />
      <Input
        value={form.partyName}
        placeholder="Customer name"
        onChange={(event) => setForm({ ...form, partyName: event.target.value })}
      />
      <Input
        value={form.mode}
        placeholder="Mode"
        onChange={(event) => setForm({ ...form, mode: event.target.value })}
      />
      <Input
        value={form.ledgerName ?? ""}
        placeholder="Ledger"
        onChange={(event) => setForm({ ...form, ledgerName: event.target.value })}
      />
      <Input
        type="number"
        value={form.amount}
        placeholder="Amount"
        onChange={(event) => setForm({ ...form, amount: Number(event.target.value || 0) })}
      />
      <Input
        type="number"
        value={form.tdsAmount}
        placeholder="TDS"
        onChange={(event) => setForm({ ...form, tdsAmount: Number(event.target.value || 0) })}
      />
      <Input
        type="number"
        value={form.discountAmount}
        placeholder="Discount"
        onChange={(event) => setForm({ ...form, discountAmount: Number(event.target.value || 0) })}
      />
      <Input
        value={form.referenceNo ?? ""}
        placeholder="Reference no"
        onChange={(event) => setForm({ ...form, referenceNo: event.target.value })}
      />
    </div>
  );
}

function ReceiptAllocationsTab({
  form,
  setForm,
}: {
  readonly form: ReceiptInput;
  readonly setForm: (value: ReceiptInput) => void;
}) {
  return (
    <div className="space-y-3">
      {form.allocations.map((allocation, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-md border border-border/70 p-3 md:grid-cols-4"
        >
          <Input
            value={allocation.documentNo}
            placeholder="Sales no"
            onChange={(event) =>
              setAllocation(form, setForm, index, { documentNo: event.target.value })
            }
          />
          <Input
            type="date"
            value={allocation.documentDate ?? ""}
            onChange={(event) =>
              setAllocation(form, setForm, index, { documentDate: event.target.value })
            }
          />
          <Input
            type="number"
            value={allocation.previousBalance}
            placeholder="Balance"
            onChange={(event) =>
              setAllocation(form, setForm, index, {
                previousBalance: Number(event.target.value || 0),
              })
            }
          />
          <Input
            type="number"
            value={allocation.allocatedAmount}
            placeholder="Allocated"
            onChange={(event) =>
              setAllocation(form, setForm, index, {
                allocatedAmount: Number(event.target.value || 0),
              })
            }
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="rounded-xl"
        onClick={() =>
          setForm({ ...form, allocations: [...form.allocations, defaultReceiptAllocation()] })
        }
      >
        Add allocation
      </Button>
    </div>
  );
}

function setAllocation(
  form: ReceiptInput,
  setForm: (value: ReceiptInput) => void,
  index: number,
  patch: Partial<ReceiptInput["allocations"][number]>,
) {
  setForm({
    ...form,
    allocations: form.allocations.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    ),
  });
}

function ListHeader({
  align = "left",
  children,
}: {
  readonly align?: "left" | "right";
  readonly children: ReactNode;
}) {
  return (
    <th
      className={`border-b border-border/70 px-4 py-2.5 text-${align} text-sm font-medium text-foreground`}
    >
      {children}
    </th>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}

const entryShowCardClassName = "rounded-md [&>div:last-child]:p-6 sm:[&>div:last-child]:p-7";
