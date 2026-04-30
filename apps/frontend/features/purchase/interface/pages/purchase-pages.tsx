"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Plus, Printer, X } from "lucide-react";
import {
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
  buildPurchaseColumnOptions,
  deletePurchase,
  filterPurchase,
  formatEntryDate,
  formatMoney,
  getPurchase,
  listPurchase,
  preparePurchaseInput,
  upsertPurchase,
} from "../../application/purchase-service";
import {
  defaultPurchaseInput,
  defaultPurchaseItem,
  defaultPurchaseColumnVisibility,
  purchaseStatusFilters,
  type PurchaseColumnId,
  type PurchaseInput,
  type PurchaseRecord,
  type PurchaseStatusFilter,
} from "../../domain/purchase";

export function PurchaseListPage() {
  const [records, setRecords] = useState<readonly PurchaseRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PurchaseStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [visibleColumns, setVisibleColumns] = useState<Record<PurchaseColumnId, boolean>>(
    defaultPurchaseColumnVisibility,
  );
  useEffect(() => void listPurchase().then(setRecords), []);
  const filtered = useMemo(
    () =>
      filterPurchase(records, search, statusFilter).sort((left, right) =>
        left.documentNo.localeCompare(right.documentNo),
      ),
    [records, search, statusFilter],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageRecords = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const columnOptions = useMemo(
    () =>
      buildPurchaseColumnOptions({
        visibleColumns,
        onToggle: (columnId, checked) =>
          setVisibleColumns((currentValue) => ({ ...currentValue, [columnId]: checked })),
      }),
    [visibleColumns],
  );

  async function remove(record: PurchaseRecord) {
    try {
      await deletePurchase(record.id);
      setRecords((currentRecords) => currentRecords.filter((item) => item.id !== record.id));
      toast.success("Purchase deleted");
    } catch (error) {
      toast.error("Could not delete purchase", { description: getErrorMessage(error) });
    }
  }

  async function restore(record: PurchaseRecord) {
    try {
      const restored = await upsertPurchase(
        preparePurchaseInput({
          ...defaultPurchaseInput(),
          ...record,
          documentDate: record.documentDate.slice(0, 10),
          dueDate: record.dueDate ? record.dueDate.slice(0, 10) : null,
          supplierInvoiceDate: record.supplierInvoiceDate
            ? record.supplierInvoiceDate.slice(0, 10)
            : null,
          isActive: true,
        }),
        record.id,
      );
      setRecords((currentRecords) =>
        currentRecords.map((item) => (item.id === restored.id ? restored : item)),
      );
      toast.success("Purchase restored");
    } catch (error) {
      toast.error("Could not restore purchase", { description: getErrorMessage(error) });
    }
  }

  return (
    <MasterListPageFrame
      action={
        <Button asChild className="rounded-xl">
          <Link href="/desk/purchase/new">
            <Plus className="size-4" />
            New Purchase
          </Link>
        </Button>
      }
      description="Create and review supplier purchase bills."
      technicalName="page.entries.purchase.list"
      title="Purchase"
    >
      <MasterListToolbarCard
        columns={columnOptions}
        filterOptions={purchaseStatusFilters}
        filterValue={statusFilter}
        onFilterValueChange={(nextValue) => {
          setStatusFilter(nextValue as PurchaseStatusFilter);
          setCurrentPage(1);
        }}
        onSearchValueChange={(nextValue) => {
          setSearch(nextValue);
          setCurrentPage(1);
        }}
        onShowAllColumns={() => setVisibleColumns(defaultPurchaseColumnVisibility)}
        searchPlaceholder="Search bill, supplier, supplier invoice, reference, or status"
        searchValue={search}
      />
      <MasterListTableCard className="rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-sm">
            <thead className="bg-muted/55">
              <tr>
                {visibleColumns.documentNo ? <ListHeader>Bill</ListHeader> : null}
                {visibleColumns.documentDate ? <ListHeader>Date</ListHeader> : null}
                {visibleColumns.party ? <ListHeader>Supplier</ListHeader> : null}
                {visibleColumns.supplierInvoice ? <ListHeader>Supplier invoice</ListHeader> : null}
                {visibleColumns.status ? <ListHeader>Status</ListHeader> : null}
                {visibleColumns.paymentStatus ? <ListHeader>Payment</ListHeader> : null}
                {visibleColumns.total ? <ListHeader align="right">Total</ListHeader> : null}
                {visibleColumns.balance ? <ListHeader align="right">Balance</ListHeader> : null}
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
                        href={`/desk/purchase/${record.id}`}
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
                  {visibleColumns.supplierInvoice ? (
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {record.supplierInvoiceNo ?? "-"}
                    </td>
                  ) : null}
                  {visibleColumns.status ? <td className="px-4 py-2.5">{record.status}</td> : null}
                  {visibleColumns.paymentStatus ? (
                    <td className="px-4 py-2.5 text-muted-foreground">{record.paymentStatus}</td>
                  ) : null}
                  {visibleColumns.total ? (
                    <td className="px-4 py-2.5 text-right">{formatMoney(record.grandTotal)}</td>
                  ) : null}
                  {visibleColumns.balance ? (
                    <td className="px-4 py-2.5 text-right">{formatMoney(record.balanceAmount)}</td>
                  ) : null}
                  {visibleColumns.updated ? (
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {formatEntryDate(record.updatedAt)}
                    </td>
                  ) : null}
                  <td className="px-4 py-2 text-right">
                    <RowActionMenu
                      editHref={`/desk/purchase/${record.id}/edit`}
                      isActive={record.isActive}
                      viewHref={`/desk/purchase/${record.id}`}
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
          <MasterListEmptyState>No purchase bills found.</MasterListEmptyState>
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
        singularLabel="purchase bills"
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

export function PurchaseShowPage({ purchaseId }: { readonly purchaseId: number }) {
  const [record, setRecord] = useState<PurchaseRecord | null>(null);
  useEffect(() => void getPurchase(purchaseId).then(setRecord), [purchaseId]);
  return (
    <MasterListPageFrame
      action={
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-xl">
            <Link href={`/desk/purchase/${purchaseId}/edit`}>Edit</Link>
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print
          </Button>
        </div>
      }
      description={record?.partyName ?? "Loading purchase."}
      technicalName="page.entries.purchase.show"
      title={record?.documentNo ?? "Purchase"}
    >
      <MasterListShowCard className={entryShowCardClassName} title="Totals">
        {record ? `${formatMoney(record.grandTotal)} / ${record.paymentStatus}` : "Loading."}
      </MasterListShowCard>
    </MasterListPageFrame>
  );
}

export function PurchaseUpsertPage({ purchaseId }: { readonly purchaseId?: number }) {
  const router = useRouter();
  const [form, setForm] = useState<PurchaseInput>(defaultPurchaseInput());
  useEffect(() => {
    if (purchaseId)
      void getPurchase(purchaseId).then(
        (record) =>
          record &&
          setForm({
            ...defaultPurchaseInput(),
            ...record,
            documentDate: record.documentDate.slice(0, 10),
          }),
      );
  }, [purchaseId]);
  async function save(printAfterSave = false) {
    const record = await upsertPurchase(preparePurchaseInput(form), purchaseId);
    toast.success(purchaseId ? "Purchase updated" : "Purchase created");
    if (printAfterSave) {
      window.print();
    }
    router.push(`/desk/purchase/${record.id}`);
  }
  return (
    <MasterListPageFrame
      action={
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={purchaseId ? `/desk/purchase/${purchaseId}` : "/desk/purchase"}>
            <X className="size-4" />
            Cancel
          </Link>
        </Button>
      }
      description="Basic purchase billing entry."
      technicalName="page.entries.purchase.upsert"
      title={purchaseId ? "Edit purchase" : "New purchase"}
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
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                value={form.documentNo}
                placeholder="Bill no"
                onChange={(event) => setForm({ ...form, documentNo: event.target.value })}
              />
              <Input
                type="date"
                value={form.documentDate}
                onChange={(event) => setForm({ ...form, documentDate: event.target.value })}
              />
              <Input
                value={form.partyName}
                placeholder="Supplier name"
                onChange={(event) => setForm({ ...form, partyName: event.target.value })}
              />
              <Input
                value={form.supplierInvoiceNo ?? ""}
                placeholder="Supplier invoice no"
                onChange={(event) => setForm({ ...form, supplierInvoiceNo: event.target.value })}
              />
            </div>
            {form.items.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-md border border-border/70 p-3 md:grid-cols-4"
              >
                <Input
                  value={item.productName}
                  placeholder="Product"
                  onChange={(event) =>
                    setItem(form, setForm, index, { productName: event.target.value })
                  }
                />
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(event) =>
                    setItem(form, setForm, index, { quantity: Number(event.target.value || 0) })
                  }
                />
                <Input
                  type="number"
                  value={item.rate}
                  onChange={(event) =>
                    setItem(form, setForm, index, { rate: Number(event.target.value || 0) })
                  }
                />
                <Input
                  type="number"
                  value={item.taxRate}
                  onChange={(event) =>
                    setItem(form, setForm, index, { taxRate: Number(event.target.value || 0) })
                  }
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setForm({ ...form, items: [...form.items, defaultPurchaseItem()] })}
            >
              Add item
            </Button>
            <Separator />
            <SavePrintButtons saveLabel="Save purchase" onSavePrint={() => void save(true)} />
          </form>
        </MasterListUpsertCard>
      </MasterListUpsertLayout>
    </MasterListPageFrame>
  );
}

function setItem(
  form: PurchaseInput,
  setForm: (value: PurchaseInput) => void,
  index: number,
  patch: Partial<PurchaseInput["items"][number]>,
) {
  setForm({
    ...form,
    items: form.items.map((item, itemIndex) =>
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
