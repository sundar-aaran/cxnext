"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Printer } from "lucide-react";
import { Button, Input, MasterListPageFrame } from "@cxnext/ui";
import { formatMoney, listSales } from "../../../sales/application/sales-service";
import type { SalesRecord } from "../../../sales/domain/sales";
import { listPurchase } from "../../../purchase/application/purchase-service";
import type { PurchaseRecord } from "../../../purchase/domain/purchase";
import { listReceipts } from "../../../receipt/application/receipt-service";
import type { ReceiptRecord } from "../../../receipt/domain/receipt";
import { listPayments } from "../../../payment/application/payment-service";
import type { PaymentRecord } from "../../../payment/domain/payment";
import { listCommonRecords, type CommonRecord } from "../../../common/application/common-service";
import { loadSoftwareSettings } from "../../../settings/application/software-settings-service";
import {
  defaultSoftwareSettingsState,
  type DutiesTaxSettings,
} from "../../../settings/domain/software-settings";

type ReportKind = "customer" | "gst" | "supplier";

export function CustomerStatementReportPage() {
  const [sales, setSales] = useState<readonly SalesRecord[]>([]);
  const [receipts, setReceipts] = useState<readonly ReceiptRecord[]>([]);
  const [filters, setFilters] = useReportFilters();

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      listSales({ signal: controller.signal }).catch(() => []),
      listReceipts({ signal: controller.signal }).catch(() => []),
    ]).then(([salesRecords, receiptRecords]) => {
      setSales(salesRecords);
      setReceipts(receiptRecords);
    });
    return () => controller.abort();
  }, []);

  const rows = useMemo(
    () => buildCustomerStatementRows(sales, receipts, filters),
    [filters, receipts, sales],
  );

  return (
    <StatementReportFrame
      description="Review customer sales invoices, balances, and references."
      filters={filters}
      kind="customer"
      rows={rows}
      title="Customer Statement"
      onFiltersChange={setFilters}
    />
  );
}

export function SupplierStatementReportPage() {
  const [purchases, setPurchases] = useState<readonly PurchaseRecord[]>([]);
  const [payments, setPayments] = useState<readonly PaymentRecord[]>([]);
  const [filters, setFilters] = useReportFilters();

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      listPurchase({ signal: controller.signal }).catch(() => []),
      listPayments({ signal: controller.signal }).catch(() => []),
    ]).then(([purchaseRecords, paymentRecords]) => {
      setPurchases(purchaseRecords);
      setPayments(paymentRecords);
    });
    return () => controller.abort();
  }, []);

  const rows = useMemo(
    () => buildSupplierStatementRows(purchases, payments, filters),
    [filters, payments, purchases],
  );

  return (
    <StatementReportFrame
      description="Review supplier purchase bills, balances, and references."
      filters={filters}
      kind="supplier"
      rows={rows}
      title="Supplier Statement"
      onFiltersChange={setFilters}
    />
  );
}

export function GstStatementReportPage() {
  const [sales, setSales] = useState<readonly SalesRecord[]>([]);
  const [purchases, setPurchases] = useState<readonly PurchaseRecord[]>([]);
  const defaultMonth = useMemo(() => currentReportMonth(), []);
  const [filters, setFilters] = useReportFilters(defaultMonth);
  const [monthOptions, setMonthOptions] = useState<readonly ReportMonthOption[]>([defaultMonth]);
  const [dutiesTaxSettings, setDutiesTaxSettings] = useState<DutiesTaxSettings>(
    defaultSoftwareSettingsState.dutiesTaxSettings,
  );

  useEffect(() => {
    const controller = new AbortController();
    setDutiesTaxSettings(loadSoftwareSettings().dutiesTaxSettings);
    void Promise.all([
      listSales({ signal: controller.signal }).catch(() => []),
      listPurchase({ signal: controller.signal }).catch(() => []),
    ]).then(([salesRecords, purchaseRecords]) => {
      setSales(salesRecords);
      setPurchases(purchaseRecords);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void listCommonRecords("months", { signal: controller.signal })
      .then((records) => {
        if (controller.signal.aborted) return;
        const options = toReportMonthOptions(records);
        if (!options.length) return;
        setMonthOptions(options);
        const selected = options.find((option) => option.value === filters.monthId) ?? options[0];
        setFilters((current) => ({
          ...current,
          monthId: selected.value,
          fromDate: selected.fromDate,
          toDate: selected.toDate,
        }));
      })
      .catch(() => {
        setMonthOptions(
          Array.from({ length: 12 }, (_, index) => reportMonthFor(new Date().getFullYear(), index)),
        );
      });
    return () => controller.abort();
  }, []);

  const salesRows = useMemo(() => buildGstRows(sales, filters), [filters, sales]);
  const purchaseRows = useMemo(() => buildGstRows(purchases, filters), [filters, purchases]);
  const salesTotals = useMemo(() => gstRowTotals(salesRows), [salesRows]);
  const purchaseTotals = useMemo(() => gstRowTotals(purchaseRows), [purchaseRows]);
  const openingTotals = useMemo(
    () => buildOpeningGstTotals(sales, purchases, filters, dutiesTaxSettings),
    [dutiesTaxSettings, filters, purchases, sales],
  );
  const yearSalesTotals = useMemo(
    () => buildYearGstTotals(sales, filters),
    [filters, sales],
  );
  const yearPurchaseTotals = useMemo(
    () => buildYearGstTotals(purchases, filters),
    [filters, purchases],
  );
  const balanceGst = openingTotals.gst + purchaseTotals.gst - salesTotals.gst;

  return (
    <MasterListPageFrame
      action={<PrintButton />}
      className="w-[calc(100%-2rem)] max-w-[1500px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]"
      description="Review GST taxable value, tax amount, and total movement."
      technicalName="page.reports.gst-statement"
      title="GST Statement"
    >
      <ReportFilters
        filters={filters}
        monthOptions={monthOptions}
        showPartyFilter={false}
        onChange={setFilters}
      />
      <ReportPrintSheet title="GST Statement">
        <div className="grid gap-4 xl:grid-cols-2">
          <GstSideTable rows={salesRows} title="Sales" />
          <GstSideTable rows={purchaseRows} title="Purchase" />
        </div>
        <GstSummaryCards
          balanceGst={balanceGst}
          openingTotals={openingTotals}
          purchaseTotals={purchaseTotals}
          salesTotals={salesTotals}
          yearPurchaseTotals={yearPurchaseTotals}
          yearSalesTotals={yearSalesTotals}
        />
      </ReportPrintSheet>
    </MasterListPageFrame>
  );
}

interface ReportFiltersValue {
  readonly fromDate: string;
  readonly monthId: string;
  readonly party: string;
  readonly toDate: string;
}

interface ReportMonthOption {
  readonly fromDate: string;
  readonly label: string;
  readonly toDate: string;
  readonly value: string;
}

interface StatementRow {
  readonly age: number;
  readonly balance: number;
  readonly credit: number;
  readonly date: string;
  readonly debit: number;
  readonly description: string;
  readonly party: string;
  readonly reference: string;
  readonly type: string;
  readonly voucherNo: string;
}

interface GstRow {
  readonly cgst: number;
  readonly date: string;
  readonly gst: number;
  readonly igst: number;
  readonly party: string;
  readonly sgst: number;
  readonly taxable: number;
  readonly total: number;
  readonly voucherNo: string;
}

interface GstTotals {
  readonly cgst: number;
  readonly gst: number;
  readonly igst: number;
  readonly sgst: number;
  readonly taxable: number;
  readonly total: number;
}

function StatementReportFrame({
  description,
  filters,
  kind,
  onFiltersChange,
  rows,
  title,
}: {
  readonly description: string;
  readonly filters: ReportFiltersValue;
  readonly kind: ReportKind;
  readonly onFiltersChange: (value: ReportFiltersValue) => void;
  readonly rows: readonly StatementRow[];
  readonly title: string;
}) {
  return (
    <MasterListPageFrame
      action={<PrintButton />}
      className="w-[calc(100%-2rem)] max-w-[1500px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]"
      description={description}
      technicalName={`page.reports.${kind}-statement`}
      title={title}
    >
      <ReportFilters filters={filters} onChange={onFiltersChange} />
      <ReportPrintSheet title={title}>
        <ReportTable
          headers={[
            "Date",
            "Type",
            "Voucher",
            kind === "supplier" ? "Supplier" : "Customer",
            "Reference",
            kind === "supplier" ? "Purchase" : "Sales",
            kind === "supplier" ? "Payment" : "Receipt",
            "Balance",
            "Age",
          ]}
          rows={rows.map((row) => [
            formatDate(row.date),
            row.type,
            row.voucherNo,
            row.party,
            row.reference,
            formatMoney(row.debit),
            formatMoney(row.credit),
            formatMoney(row.balance),
            String(row.age),
          ])}
          totals={[
            "",
            "",
            "",
            "",
            "TOTALS.",
            formatMoney(sum(rows, "debit")),
            formatMoney(sum(rows, "credit")),
            formatMoney(rows.at(-1)?.balance ?? 0),
            "",
          ]}
        />
      </ReportPrintSheet>
    </MasterListPageFrame>
  );
}

function ReportFilters({
  filters,
  monthOptions,
  onChange,
  showPartyFilter = true,
}: {
  readonly filters: ReportFiltersValue;
  readonly monthOptions?: readonly ReportMonthOption[];
  readonly onChange: (value: ReportFiltersValue) => void;
  readonly showPartyFilter?: boolean;
}) {
  return (
    <div className="mb-4 grid gap-3 rounded-md border border-border/70 bg-card p-4 print:hidden md:grid-cols-3">
      {monthOptions ? (
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
          value={filters.monthId}
          onChange={(event) => {
            const option = monthOptions.find((item) => item.value === event.target.value);
            onChange({
              ...filters,
              monthId: event.target.value,
              fromDate: option?.fromDate ?? filters.fromDate,
              toDate: option?.toDate ?? filters.toDate,
            });
          }}
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
      <Input
        type="date"
        value={filters.fromDate}
        onChange={(event) => onChange({ ...filters, fromDate: event.target.value, monthId: "" })}
      />
      <Input
        type="date"
        value={filters.toDate}
        onChange={(event) => onChange({ ...filters, monthId: "", toDate: event.target.value })}
      />
      {showPartyFilter ? (
        <Input
          value={filters.party}
          placeholder="Filter by customer, supplier, or party"
          onChange={(event) => onChange({ ...filters, party: event.target.value })}
        />
      ) : null}
    </div>
  );
}

function ReportPrintSheet({
  children,
  title,
}: {
  readonly children: ReactNode;
  readonly title: string;
}) {
  return (
    <section className="rounded-md border border-border/70 bg-card p-4 print:border-0 print:bg-white print:p-0">
      <div className="mb-4 hidden text-center print:block">
        <h1 className="text-lg font-bold">{title}</h1>
        <div className="text-xs">Generated report</div>
      </div>
      {children}
    </section>
  );
}

function ReportTable({
  headers,
  rows,
  totals,
}: {
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
  readonly totals: readonly string[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-sm print:min-w-0 print:text-[10px]">
        <thead className="bg-muted/55 print:bg-white">
          <tr>
            {headers.map((header, index) => (
              <th key={header} className={reportTableCellClass(headers, index, true)}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row[0]}-${row[2]}-${index}`}>
              {row.map((cell, cellIndex) => (
                <td
                  key={`${cell}-${cellIndex}`}
                  className={reportTableCellClass(headers, cellIndex)}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-muted/20 font-semibold print:bg-white">
            {totals.map((cell, index) => (
              <td
                key={`${cell}-${index}`}
                className={reportTableCellClass(headers, index)}
              >
                {cell}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function reportTableCellClass(headers: readonly string[], index: number, isHeader = false) {
  const header = headers[index];
  const alignment =
    header === "Age"
      ? "text-center"
      : ["Sales", "Purchase", "Payment", "Receipt", "Balance"].includes(header)
        ? "text-right"
        : "text-left";
  const weight = isHeader ? "font-medium" : "";
  return ["border border-border/70 px-3 py-2", alignment, weight].filter(Boolean).join(" ");
}

function GstSideTable({
  rows,
  title,
}: {
  readonly rows: readonly GstRow[];
  readonly title: string;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border/70">
      <div className="border-b border-border/70 bg-muted/45 px-3 py-2 text-sm font-semibold print:bg-white">
        {title}
      </div>
      <table className="w-full min-w-[620px] border-collapse text-sm print:min-w-0 print:text-[10px]">
        <thead>
          <tr>
            {["Date", "Voucher", "Party", "Taxable", "GST", "Total"].map((header) => (
              <th key={header} className="border border-border/70 px-3 py-2 text-left font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.voucherNo}>
              <td className="border border-border/70 px-3 py-2">{formatDate(row.date)}</td>
              <td className="border border-border/70 px-3 py-2">{row.voucherNo}</td>
              <td className="border border-border/70 px-3 py-2">{row.party}</td>
              <td className="border border-border/70 px-3 py-2 text-right">{formatMoney(row.taxable)}</td>
              <td className="border border-border/70 px-3 py-2 text-right">{formatMoney(row.gst)}</td>
              <td className="border border-border/70 px-3 py-2 text-right">{formatMoney(row.total)}</td>
            </tr>
          ))}
          <tr className="bg-muted/20 font-semibold print:bg-white">
            <td className="border border-border/70 px-3 py-2" colSpan={3}>TOTALS.</td>
            <td className="border border-border/70 px-3 py-2 text-right">{formatMoney(sum(rows, "taxable"))}</td>
            <td className="border border-border/70 px-3 py-2 text-right">{formatMoney(sum(rows, "gst"))}</td>
            <td className="border border-border/70 px-3 py-2 text-right">{formatMoney(sum(rows, "total"))}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function GstSummaryCards({
  balanceGst,
  openingTotals,
  purchaseTotals,
  salesTotals,
  yearPurchaseTotals,
  yearSalesTotals,
}: {
  readonly balanceGst: number;
  readonly openingTotals: GstTotals;
  readonly purchaseTotals: GstTotals;
  readonly salesTotals: GstTotals;
  readonly yearPurchaseTotals: GstTotals;
  readonly yearSalesTotals: GstTotals;
}) {
  const balanceTotals = {
    cgst: openingTotals.cgst + purchaseTotals.cgst - salesTotals.cgst,
    gst: balanceGst,
    igst: openingTotals.igst + purchaseTotals.igst - salesTotals.igst,
    sgst: openingTotals.sgst + purchaseTotals.sgst - salesTotals.sgst,
    taxable: openingTotals.taxable + purchaseTotals.taxable - salesTotals.taxable,
    total: openingTotals.total + purchaseTotals.total - salesTotals.total,
  };

  return (
    <div className="mt-4 grid gap-3 text-sm xl:grid-cols-2">
      <GstSummaryOverviewCard
        balanceTotals={balanceTotals}
        balanceGst={balanceGst}
        openingTotals={openingTotals}
        purchaseTotals={purchaseTotals}
        salesTotals={salesTotals}
      />
      <GstPeriodCard
        purchaseTotals={purchaseTotals}
        salesTotals={salesTotals}
        yearPurchaseTotals={yearPurchaseTotals}
        yearSalesTotals={yearSalesTotals}
      />
    </div>
  );
}

function GstSummaryOverviewCard({
  balanceTotals,
  balanceGst,
  openingTotals,
  purchaseTotals,
  salesTotals,
}: {
  readonly balanceTotals: GstTotals;
  readonly balanceGst: number;
  readonly openingTotals: GstTotals;
  readonly purchaseTotals: GstTotals;
  readonly salesTotals: GstTotals;
}) {
  return (
    <GstSummarySection title="GST Summary">
      <GstSummaryBlock title="GST Balance">
        <GstSummaryGrid>
          <GstMetricCard label="Opening GST" value={formatMoney(openingTotals.gst)} />
          <GstMetricCard label="Purchase GST" value={formatMoney(purchaseTotals.gst)} />
          <GstMetricCard label="Sales GST" value={formatMoney(salesTotals.gst)} />
          <GstMetricCard
            label="Balance"
            toneValue={balanceGst}
            value={formatSignedMoney(balanceGst)}
            strong
          />
        </GstSummaryGrid>
      </GstSummaryBlock>
      <GstSummaryBlock title="Tax Split">
        <GstSummaryGrid>
          <GstTaxSplitCard label="Opening" totals={openingTotals} />
          <GstTaxSplitCard label="Purchase" totals={purchaseTotals} />
          <GstTaxSplitCard label="Sales" totals={salesTotals} />
          <GstTaxSplitCard label="Balance" totals={balanceTotals} strong />
        </GstSummaryGrid>
      </GstSummaryBlock>
    </GstSummarySection>
  );
}

function GstPeriodCard({
  purchaseTotals,
  salesTotals,
  yearPurchaseTotals,
  yearSalesTotals,
}: {
  readonly purchaseTotals: GstTotals;
  readonly salesTotals: GstTotals;
  readonly yearPurchaseTotals: GstTotals;
  readonly yearSalesTotals: GstTotals;
}) {
  return (
    <GstSummarySection title="Period Comparison">
      <GstSummaryGrid className="xl:grid-cols-2">
        <GstPeriodMiniCard
          title="This month"
          purchaseTotals={purchaseTotals}
          salesTotals={salesTotals}
        />
        <GstPeriodMiniCard
          title="This year"
          purchaseTotals={yearPurchaseTotals}
          salesTotals={yearSalesTotals}
        />
      </GstSummaryGrid>
    </GstSummarySection>
  );
}

function GstSummarySection({
  children,
  title,
}: {
  readonly children: ReactNode;
  readonly title: string;
}) {
  return (
    <section className="rounded-md border border-border/70 bg-card p-3 shadow-sm print:shadow-none">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function GstSummaryBlock({
  children,
  title,
}: {
  readonly children: ReactNode;
  readonly title: string;
}) {
  return (
    <div className="grid gap-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function GstSummaryGrid({
  children,
  className = "xl:grid-cols-4",
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <div
      className={`grid overflow-hidden rounded-md border border-border divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0 ${className}`}
    >
      {children}
    </div>
  );
}

function GstMetricCard({
  label,
  strong = false,
  toneValue,
  value,
}: {
  readonly label: string;
  readonly strong?: boolean;
  readonly toneValue?: number;
  readonly value: string;
}) {
  return (
    <div className="grid min-h-20 grid-rows-[auto_1fr] bg-card px-3 py-2">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className={`self-end text-right text-base tabular-nums ${strong ? "font-semibold" : ""} ${toneClass(toneValue)}`}>
        {value}
      </div>
    </div>
  );
}

function GstTaxSplitCard({
  label,
  strong = false,
  totals,
}: {
  readonly label: string;
  readonly strong?: boolean;
  readonly totals: GstTotals;
}) {
  return (
    <div className={`grid bg-card ${strong ? "font-semibold" : ""}`}>
      <div className="border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="grid grid-cols-3 divide-x divide-border text-xs">
        <TaxSplitValue label="IGST" value={totals.igst} />
        <TaxSplitValue label="CGST" value={totals.cgst} />
        <TaxSplitValue label="SGST" value={totals.sgst} />
      </div>
    </div>
  );
}

function TaxSplitValue({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <div className="grid gap-1 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right tabular-nums ${toneClass(value)}`}>{formatMoney(value)}</span>
    </div>
  );
}

function GstPeriodMiniCard({
  purchaseTotals,
  salesTotals,
  title,
}: {
  readonly purchaseTotals: GstTotals;
  readonly salesTotals: GstTotals;
  readonly title: string;
}) {
  const differenceTotals = subtractGstTotals(salesTotals, purchaseTotals);
  return (
    <div className="bg-card">
      <div className="border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">{title}</div>
      <div className="grid grid-cols-[6rem_repeat(3,minmax(0,1fr))] border-b border-border bg-muted/20 text-xs text-muted-foreground print:bg-white">
        <span />
        <span className="border-l border-border px-2 py-1.5 text-right">Taxable</span>
        <span className="border-l border-border px-2 py-1.5 text-right">Tax</span>
        <span className="border-l border-border px-2 py-1.5 text-right">Total</span>
      </div>
      <GstPeriodLine label="Sales" totals={salesTotals} />
      <GstPeriodLine label="Purchase" totals={purchaseTotals} />
      <GstPeriodLine label="Difference" totals={differenceTotals} strong />
    </div>
  );
}

function GstPeriodLine({
  label,
  strong = false,
  totals,
}: {
  readonly label: string;
  readonly strong?: boolean;
  readonly totals: GstTotals;
}) {
  return (
    <div className={`grid grid-cols-[6rem_repeat(3,minmax(0,1fr))] border-b border-border last:border-b-0 ${strong ? "bg-muted/15 font-semibold print:bg-white" : ""}`}>
      <span className="px-3 py-1.5">{label}</span>
      <span className={`border-l border-border px-2 py-1.5 text-right tabular-nums ${toneClass(strong ? totals.taxable : undefined)}`}>{formatMoney(totals.taxable)}</span>
      <span className={`border-l border-border px-2 py-1.5 text-right tabular-nums ${toneClass(strong ? totals.gst : undefined)}`}>{formatMoney(totals.gst)}</span>
      <span className={`border-l border-border px-2 py-1.5 text-right tabular-nums ${toneClass(strong ? totals.total : undefined)}`}>{formatMoney(totals.total)}</span>
    </div>
  );
}

function PrintButton() {
  return (
    <Button className="rounded-xl print:hidden" onClick={() => window.print()}>
      <Printer className="size-4" />
      Print
    </Button>
  );
}

function useReportFilters(initialMonth?: ReportMonthOption) {
  return useState<ReportFiltersValue>({
    fromDate: initialMonth?.fromDate ?? "",
    monthId: initialMonth?.value ?? "",
    party: "",
    toDate: initialMonth?.toDate ?? "",
  });
}

function currentReportMonth() {
  const today = new Date();
  return reportMonthFor(today.getFullYear(), today.getMonth());
}

function reportMonthFor(year: number, monthIndex: number): ReportMonthOption {
  const month = String(monthIndex + 1).padStart(2, "0");
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const fromDate = `${year}-${month}-01`;
  const toDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
  return {
    fromDate,
    label: monthLabel(year, monthIndex),
    toDate,
    value: `${year}-${month}`,
  };
}

function toReportMonthOptions(records: readonly CommonRecord[]): readonly ReportMonthOption[] {
  const options = records
    .map((record) => {
      const fromDate = stringValue(record.startDate ?? record.start_date);
      const toDate = stringValue(record.endDate ?? record.end_date);
      if (!fromDate || !toDate) return null;
      const fallbackValue = fromDate.slice(0, 7);
      const date = new Date(`${fromDate}T00:00:00`);
      const label = stringValue(record.name) || monthLabel(date.getFullYear(), date.getMonth());
      return {
        fromDate,
        label,
        toDate,
        value: stringValue(record.code) || fallbackValue,
      };
    })
    .filter((option): option is ReportMonthOption => Boolean(option));

  return options.length
    ? options.sort((left, right) => left.fromDate.localeCompare(right.fromDate))
    : Array.from({ length: 12 }, (_, index) => reportMonthFor(new Date().getFullYear(), index));
}

function monthLabel(year: number, monthIndex: number) {
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    new Date(year, monthIndex, 1),
  );
  return `${monthName} -${year}`;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function buildCustomerStatementRows(
  sales: readonly SalesRecord[],
  receipts: readonly ReceiptRecord[],
  filters: ReportFiltersValue,
) {
  return withRunningBalance(
    [
      ...sales.map((record) => statementRow(record, "Sales", record.grandTotal, 0)),
      ...receipts.map((record) => statementRow(record, "Receipt", 0, record.netAmount)),
    ],
    filters,
  );
}

function buildSupplierStatementRows(
  purchases: readonly PurchaseRecord[],
  payments: readonly PaymentRecord[],
  filters: ReportFiltersValue,
) {
  return withRunningBalance(
    [
      ...purchases.map((record) => statementRow(record, "Purchase", record.grandTotal, 0)),
      ...payments.map((record) => statementRow(record, "Payment", 0, record.netAmount)),
    ],
    filters,
  );
}

function statementRow(
  record: Pick<SalesRecord, "documentDate" | "documentNo" | "partyName" | "referenceNo">,
  type: string,
  debit: number,
  credit: number,
): StatementRow {
  return {
    age: ageInDays(record.documentDate),
    balance: 0,
    credit,
    date: record.documentDate,
    debit,
    description: type,
    party: record.partyName,
    reference: record.referenceNo ?? "",
    type,
    voucherNo: record.documentNo,
  };
}

function withRunningBalance(rows: readonly StatementRow[], filters: ReportFiltersValue) {
  let balance = 0;
  return rows
    .filter((row) => inDateRange(row.date, filters.fromDate, filters.toDate))
    .filter((row) => matchesParty(row.party, filters.party))
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((row) => {
      balance += row.debit - row.credit;
      return { ...row, balance };
    });
}

function buildGstRows(
  records: readonly (PurchaseRecord | SalesRecord)[],
  filters: ReportFiltersValue,
) {
  return records
    .filter((record) => inDateRange(record.documentDate, filters.fromDate, filters.toDate))
    .filter((record) => matchesParty(record.partyName, filters.party))
    .map((record): GstRow => {
      const totals = gstTotals(record);
      return {
        cgst: totals.cgst,
        date: record.documentDate,
        gst: totals.gst,
        igst: totals.igst,
        party: record.partyName,
        sgst: totals.sgst,
        taxable: totals.taxable,
        total: totals.total,
        voucherNo: record.documentNo,
      };
    })
    .sort((left, right) => left.date.localeCompare(right.date));
}

function gstTotals(record: PurchaseRecord | SalesRecord): GstTotals {
  const taxable = record.items.reduce((sumTotal, item) => sumTotal + item.quantity * item.rate, 0);
  const gst = record.items.reduce(
    (sumTotal, item) => sumTotal + (item.quantity * item.rate * item.taxRate) / 100,
    0,
  );
  const isIgst = record.placeOfSupply === "igst";
  const igst = isIgst ? gst : 0;
  const cgst = isIgst ? 0 : gst / 2;
  const sgst = isIgst ? 0 : gst / 2;
  return { cgst, gst, igst, sgst, taxable, total: taxable + gst + Number(record.roundOff ?? 0) };
}

function buildOpeningGstTotals(
  sales: readonly SalesRecord[],
  purchases: readonly PurchaseRecord[],
  filters: ReportFiltersValue,
  settings: DutiesTaxSettings,
) {
  const configuredOpening = openingGstTotalsFromSettings(settings);
  if (!filters.fromDate) return configuredOpening;
  const asOnDate = settings.openingGstAsOnDate;
  const afterAsOnDate = (record: PurchaseRecord | SalesRecord) =>
    !asOnDate || record.documentDate.slice(0, 10) > asOnDate;
  const priorSalesTotals = aggregateGstRecords(
    sales
      .filter((record) => afterAsOnDate(record))
      .filter((record) => record.documentDate.slice(0, 10) < filters.fromDate)
      .filter((record) => matchesParty(record.partyName, filters.party)),
  );
  const priorPurchaseTotals = aggregateGstRecords(
    purchases
      .filter((record) => afterAsOnDate(record))
      .filter((record) => record.documentDate.slice(0, 10) < filters.fromDate)
      .filter((record) => matchesParty(record.partyName, filters.party)),
  );
  return addGstTotals(configuredOpening, subtractGstTotals(priorPurchaseTotals, priorSalesTotals));
}

function buildYearGstTotals(
  records: readonly (PurchaseRecord | SalesRecord)[],
  filters: ReportFiltersValue,
) {
  const year = (filters.fromDate || filters.toDate || new Date().toISOString()).slice(0, 4);
  return aggregateGstRecords(
    records
      .filter((record) => record.documentDate.slice(0, 4) === year)
      .filter((record) => matchesParty(record.partyName, filters.party)),
  );
}

function aggregateGstRecords(records: readonly (PurchaseRecord | SalesRecord)[]) {
  return records.reduce((total, record) => addGstTotals(total, gstTotals(record)), emptyGstTotals());
}

function gstRowTotals(rows: readonly GstRow[]): GstTotals {
  return {
    cgst: sum(rows, "cgst"),
    gst: sum(rows, "gst"),
    igst: sum(rows, "igst"),
    sgst: sum(rows, "sgst"),
    taxable: sum(rows, "taxable"),
    total: sum(rows, "total"),
  };
}

function emptyGstTotals(): GstTotals {
  return { cgst: 0, gst: 0, igst: 0, sgst: 0, taxable: 0, total: 0 };
}

function openingGstTotalsFromSettings(settings: DutiesTaxSettings): GstTotals {
  const igst = Number(settings.openingGstIgst || 0);
  const cgst = Number(settings.openingGstCgst || 0);
  const sgst = Number(settings.openingGstSgst || 0);
  const gst = igst + cgst + sgst;
  return { cgst, gst, igst, sgst, taxable: 0, total: gst };
}

function addGstTotals(left: GstTotals, right: GstTotals): GstTotals {
  return {
    cgst: left.cgst + right.cgst,
    gst: left.gst + right.gst,
    igst: left.igst + right.igst,
    sgst: left.sgst + right.sgst,
    taxable: left.taxable + right.taxable,
    total: left.total + right.total,
  };
}

function subtractGstTotals(left: GstTotals, right: GstTotals): GstTotals {
  return {
    cgst: left.cgst - right.cgst,
    gst: left.gst - right.gst,
    igst: left.igst - right.igst,
    sgst: left.sgst - right.sgst,
    taxable: left.taxable - right.taxable,
    total: left.total - right.total,
  };
}

function inDateRange(value: string, fromDate: string, toDate: string) {
  const date = value.slice(0, 10);
  return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
}

function matchesParty(partyName: string, filter: string) {
  return !filter.trim() || partyName.toLowerCase().includes(filter.trim().toLowerCase());
}

function sum<T>(rows: readonly T[], key: keyof T) {
  return rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

function formatSignedMoney(value: number) {
  if (value === 0) return formatMoney(0);
  return `${value > 0 ? "+" : "-"} ${formatMoney(Math.abs(value))}`;
}

function toneClass(value: number | undefined) {
  if (value === undefined) return "";
  if (value < 0) return "text-red-600";
  if (value > 0) return "text-emerald-700";
  return "text-muted-foreground";
}

function ageInDays(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
}
