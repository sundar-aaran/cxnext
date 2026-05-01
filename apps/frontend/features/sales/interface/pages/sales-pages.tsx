"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ArrowLeft, ChevronLeft, ChevronRight, Pencil, Plus, Printer } from "lucide-react";
import {
  Button,
  MasterListEmptyState,
  MasterListPageFrame,
  MasterListPaginationCard,
  MasterListTableCard,
  MasterListToolbarCard,
  RowActionMenu,
  buildMasterListShowingLabel,
  useGlobalLoader,
} from "@cxnext/ui";
import {
  buildSalesColumnOptions,
  deleteSales,
  formatEntryDate,
  filterSales,
  formatMoney,
  getSales,
  listSales,
  prepareSalesInput,
  upsertSales,
} from "../../application/sales-service";
import { listCompanies } from "../../../company/application/company-service";
import {
  defaultSalesInput,
  defaultSalesColumnVisibility,
  getSalesIndustryKind,
  salesStatusFilters,
  type SalesColumnId,
  type SalesRecord,
  type SalesStatusFilter,
} from "../../domain/sales";
import { SalesInvoiceDocument } from "./sales-print-page";
import { getSalesPrintLinePlan } from "./sales-print-line-plan";

export { SalesUpsertPage } from "./sales-upsert-page";

export function SalesListPage() {
  const [records, setRecords] = useState<readonly SalesRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SalesStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [visibleColumns, setVisibleColumns] = useState<Record<SalesColumnId, boolean>>(
    defaultSalesColumnVisibility,
  );
  const { show } = useGlobalLoader();

  useEffect(() => {
    const controller = new AbortController();
    const hide = show();
    listSales({ signal: controller.signal })
      .then(setRecords)
      .finally(() => {
        if (!controller.signal.aborted) hide();
      });
    return () => {
      controller.abort();
      hide();
    };
  }, [show]);

  const filtered = useMemo(
    () =>
      filterSales(records, search, statusFilter).sort((left, right) =>
        left.documentNo.localeCompare(right.documentNo),
      ),
    [records, search, statusFilter],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageRecords = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const columnOptions = useMemo(
    () =>
      buildSalesColumnOptions({
        visibleColumns,
        onToggle: (columnId, checked) =>
          setVisibleColumns((currentValue) => ({ ...currentValue, [columnId]: checked })),
      }),
    [visibleColumns],
  );

  async function remove(record: SalesRecord) {
    const hide = show();
    try {
      await deleteSales(record.id);
      setRecords((currentRecords) => currentRecords.filter((item) => item.id !== record.id));
      toast.success("Sales deleted");
    } catch (error) {
      toast.error("Could not delete sales", { description: getErrorMessage(error) });
    } finally {
      hide();
    }
  }

  async function restore(record: SalesRecord) {
    const hide = show();
    try {
      const restored = await upsertSales(
        prepareSalesInput({
          ...defaultSalesInput(),
          ...record,
          documentDate: record.documentDate.slice(0, 10),
          dueDate: record.dueDate ? record.dueDate.slice(0, 10) : null,
          ewayBillDate: record.ewayBillDate ? record.ewayBillDate.slice(0, 10) : null,
          isActive: true,
        }),
        record.id,
      );
      setRecords((currentRecords) =>
        currentRecords.map((item) => (item.id === restored.id ? restored : item)),
      );
      toast.success("Sales restored");
    } catch (error) {
      toast.error("Could not restore sales", { description: getErrorMessage(error) });
    } finally {
      hide();
    }
  }

  return (
    <MasterListPageFrame
      action={
        <Button asChild className="rounded-xl">
          <Link href="/desk/sales/new">
            <Plus className="size-4" />
            New Sales
          </Link>
        </Button>
      }
      description="Create and review basic sales invoices."
      technicalName="page.entries.sales.list"
      title="Sales"
    >
      <MasterListToolbarCard
        columns={columnOptions}
        filterOptions={salesStatusFilters}
        filterValue={statusFilter}
        onFilterValueChange={(nextValue) => {
          setStatusFilter(nextValue as SalesStatusFilter);
          setCurrentPage(1);
        }}
        onSearchValueChange={(nextValue) => {
          setSearch(nextValue);
          setCurrentPage(1);
        }}
        onShowAllColumns={() => setVisibleColumns(defaultSalesColumnVisibility)}
        searchPlaceholder="Search invoice, customer, date, reference, or status"
        searchValue={search}
      />
      <MasterListTableCard className="rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead className="bg-muted/55">
              <tr>
                {visibleColumns.documentNo ? <ListHeader>Invoice</ListHeader> : null}
                {visibleColumns.documentDate ? <ListHeader>Date</ListHeader> : null}
                {visibleColumns.party ? <ListHeader>Customer</ListHeader> : null}
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
                        href={`/desk/sales/${record.id}`}
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
                      editHref={`/desk/sales/${record.id}/edit`}
                      isActive={record.isActive}
                      printHref={`/desk/sales/${record.id}?print=1`}
                      viewHref={`/desk/sales/${record.id}`}
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
          <MasterListEmptyState>No sales found.</MasterListEmptyState>
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
        singularLabel="sales"
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

export function SalesShowPage({
  salesId,
  shouldPrint = false,
}: {
  readonly salesId: number;
  readonly shouldPrint?: boolean;
}) {
  const { show } = useGlobalLoader();
  const [record, setRecord] = useState<SalesRecord | null>(null);
  const [industryName, setIndustryName] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const hide = show();
    getSales(salesId, { signal: controller.signal })
      .then(setRecord)
      .finally(() => {
        if (!controller.signal.aborted) hide();
      });
    return () => {
      controller.abort();
      hide();
    };
  }, [salesId, show]);

  useEffect(() => {
    const controller = new AbortController();
    listCompanies({ signal: controller.signal })
      .then((companies) => {
        const company = companies.find((item) => item.isPrimary) ?? companies[0] ?? null;
        setIndustryName(company?.industryName ?? null);
      })
      .catch(() => setIndustryName(null));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!record || !shouldPrint) return;
    const printTimer = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(printTimer);
  }, [record, shouldPrint]);

  if (!record) {
    return (
      <MasterListPageFrame
        description="Loading sales invoice."
        technicalName="page.entries.sales.show"
        title="Sales"
      >
        <div className="rounded-md border border-border/70 bg-card p-6 text-sm text-muted-foreground">
          Loading.
        </div>
      </MasterListPageFrame>
    );
  }

  const previousSalesId = salesId > 1 ? salesId - 1 : null;
  const salesPrintLinePlan = getSalesPrintLinePlan(
    record.items,
    getSalesIndustryKind(industryName),
  );
  const itemLineRows = salesPrintLinePlan.rows.filter((row) => row.kind === "item");
  const usedItemLines = itemLineRows.reduce((total, row) => total + row.lineCount, 0);
  const blankLineCount = salesPrintLinePlan.rows.filter((row) => row.kind === "blank").length;

  return (
    <main className="theme-shell mx-auto min-h-screen w-[94%] pb-8 pt-8 text-black sm:w-[92%] lg:w-[90%] print:fixed print:inset-0 print:z-[9999] print:min-h-0 print:w-full print:overflow-visible print:bg-white print:p-0">
      <div className="mx-auto mb-3 flex w-full flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">
            {record.partyName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{record.documentNo}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button className="rounded-xl" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={`/desk/sales/${salesId}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/desk/sales">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          {previousSalesId ? (
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={`/desk/sales/${previousSalesId}`}>
                <ChevronLeft className="size-4" />
                Prev
              </Link>
            </Button>
          ) : (
            <Button variant="outline" className="rounded-xl" disabled>
              <ChevronLeft className="size-4" />
              Prev
            </Button>
          )}
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={`/desk/sales/${salesId + 1}`}>
              <ChevronRight className="size-4" />
              Next
            </Link>
          </Button>
        </div>
      </div>
      <div className="mx-auto mb-3 w-fit max-w-full rounded-md border border-border/70 bg-card/95 p-3 text-sm text-foreground shadow-sm print:hidden">
        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-medium">Invoice print lines</span>
          <span>Items: {usedItemLines}</span>
          <span>Blank: {blankLineCount}</span>
          <span>Budget: {salesPrintLinePlan.lineBudget}</span>
          <span>
            Template:{" "}
            {salesPrintLinePlan.requiresTwoPageTemplate ? "two-page required" : "single-page"}
          </span>
        </div>
        <div className="grid gap-1 text-xs text-muted-foreground">
          {itemLineRows.map((row) => (
            <div key={row.index} className="grid grid-cols-[42px_1fr_auto] gap-3">
              <span>#{row.index + 1}</span>
              <span className="truncate">
                {row.item.productName}
                {row.item.poNo ? ` | PO ${row.item.poNo.length} chars` : ""}
                {row.item.dcNo ? ` | DC ${row.item.dcNo.length} chars` : ""}
              </span>
              <span className="font-medium text-foreground">{row.lineCount} line(s)</span>
            </div>
          ))}
        </div>
      </div>
      <section className="mx-auto w-fit max-w-full overflow-hidden rounded-md border border-border/70 bg-card shadow-sm print:contents">
        <div className="overflow-x-auto p-3 print:contents sm:p-4">
          <SalesInvoiceDocument industryName={industryName} record={record} />
        </div>
      </section>
    </main>
  );
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
