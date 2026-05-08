"use client";

import { useMemo, type ReactNode } from "react";
import { calculateSalesTotals } from "../../application/sales-service";
import {
  resolveSalesBillingLayout,
  type SalesBillingLayout,
} from "../../application/sales-billing-layout-service";
import {
  getSalesIndustryKind,
  type SalesIndustryKind,
  type SalesItemInput,
  type SalesRecord,
} from "../../domain/sales";
import type { CompanyRecord } from "../../../company/domain/company";
import { MainPrintTemplate } from "./main-print-template";
import { getSalesPrintLinePlan } from "./sales-print-line-plan";

const tableClass = "w-full border-collapse border border-gray-400";
const baseCell = "border-r border-gray-400 align-top p-[3px]";
const itemCell = `${baseCell} h-[18px] border-b-4 border-double border-gray-400 text-center text-[9px] align-middle`;
const lineItemCell = `${baseCell} h-[18px] text-center text-[9px] leading-[1.08]`;
const totalItemCell = `${lineItemCell} border-y border-gray-400`;
const times = "font-['Times_New_Roman']";

export function SalesInvoiceDocument({
  company,
  industryName,
  record,
  salesLayout: providedSalesLayout,
}: {
  readonly company?: CompanyRecord | null;
  readonly industryName?: string | null;
  readonly record: SalesRecord;
  readonly salesLayout?: SalesBillingLayout;
}) {
  const totals = useMemo(
    () => calculateSalesTotals(record.items, Number(record.roundOff ?? 0)),
    [record],
  );
  const gstPercent = record.items[0]?.taxRate ?? 0;
  const isCgstSgst = (record.placeOfSupply ?? "cgst-sgst") !== "igst";
  const industryKind = getSalesIndustryKind(industryName);
  const salesLayout = providedSalesLayout ?? resolveSalesBillingLayout(industryName);
  const itemColumns = getPrintItemColumns(industryKind, salesLayout);
  const itemLinePlan = getSalesPrintLinePlan(record.items, industryKind, salesLayout);
  const companyName = printableText(company?.legalName) || printableText(company?.name);
  const companyAddressLines = company ? companyAddress(company) : [];
  const companyContactLine = company ? companyContact(company) : "";
  const companyBank = company ? primaryBankAccount(company) : null;

  return (
    <MainPrintTemplate>
      <div className="grid grid-cols-[1fr_auto_1fr] p-px text-[9px]">
        <span />
        <span className="text-[12px] font-bold">TAX INVOICE</span>
        <span className="text-right">Original Copy</span>
      </div>
      <table className={`${tableClass} border-b-0`}>
        <tbody>
          <tr>
            <td className={`${baseCell} h-[160px] w-[145px] border-r-0 text-center align-middle`}>
              <CompanyLogo company={company ?? null} companyName={companyName} />
            </td>
            <td className={`${baseCell} text-center leading-[1.6]`}>
              <div className={`${times} text-[34px] font-bold leading-tight`}>{companyName}</div>
              {companyAddressLines.map((line) => (
                <div key={line} className={times}>
                  {line}
                </div>
              ))}
              {companyContactLine ? <div className={times}>{companyContactLine}</div> : null}
              {company?.gstinUin ? <div className={times}>GSTIN: {company.gstinUin}</div> : null}
            </td>
            <td className={`${baseCell} w-[160px] border-r-0 align-middle`}>
              <div className="mx-auto flex size-[150px] items-center justify-center p-[2px]">
                <EInvoiceQrData value={record.eInvoiceSignedQr} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <table className={tableClass}>
        <tbody>
          <tr>
            <td className={`${baseCell} border-t border-gray-400 border-r-0 p-[5px]`} colSpan={3}>
              <div className="grid grid-cols-2">
                <div className="border-r border-gray-400 pr-[10px]">
                  <BillDetailsBlock record={record} />
                </div>
                <div className="pl-[10px]">
                  <EInvoiceQrSection record={record} />
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td
              className={`${baseCell} h-[58px] w-1/2 border-y border-gray-400 px-2.5 py-1 leading-tight`}
            >
              <PartyAddressBlock
                address={record.billingAddress}
                label="Buyer (Bill to)"
                partyName={record.partyName}
              />
            </td>
            <td
              className={`${baseCell} h-[58px] w-1/2 border-y border-gray-400 border-r-0 px-2.5 py-1 leading-tight`}
            >
              <PartyAddressBlock
                address={record.shippingAddress ?? record.billingAddress}
                label="Buyer (Ship to)"
                partyName={record.partyName}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <table
        className={`${tableClass} border-t-0`}
        data-print-template={
          itemLinePlan.requiresTwoPageTemplate ? "two-page-required" : "single-page"
        }
      >
        <thead>
          <tr className="bg-gray-50">
            {itemColumns.map((header) => (
              <th key={header.label} className={`${itemCell} ${header.widthClass}`}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {itemLinePlan.rows.map((row) =>
            row.kind === "item" ? (
              <SalesPrintItemRow
                key={`item-${row.index}`}
                columns={itemColumns}
                index={row.index}
                item={row.item}
              />
            ) : (
              <BlankSalesPrintItemRow key={`blank-${row.index}`} columns={itemColumns} />
            ),
          )}
          <tr>
            <td className={`${totalItemCell} text-left`}>E&amp;OE</td>
            <td
              colSpan={Math.max(1, itemColumns.length - 7)}
              className={`${totalItemCell} text-right font-bold`}
            >
              Total&nbsp;&nbsp;
            </td>
            <td className={totalItemCell}>{sumQty(record.items)}</td>
            <td className={totalItemCell} />
            <td className={`${totalItemCell} text-right`}>{money(totals.taxableAmount)}</td>
            <td colSpan={2} className={`${totalItemCell} text-right`}>
              {money(totals.gstTotal)}
            </td>
            <td className={`${totalItemCell} border-r-0 text-right`}>{money(totals.grandTotal)}</td>
          </tr>
          <tr>
            <td rowSpan={2} colSpan={5} className={`${baseCell} p-[3px] text-[8px] leading-tight`}>
              {company?.gstinUin
                ? "We hereby certify that our registration under the GST Act 2017 is in force on the date on which sale of goods specified in this invoice is made by us and the sale is effected in the regular course of business."
                : ""}
            </td>
            <SummaryLabel>Taxable Value</SummaryLabel>
            <SummaryValue>{money(totals.taxableAmount)}</SummaryValue>
          </tr>
          <tr>
            <SummaryLabel>{isCgstSgst ? "Total CGST" : ""}</SummaryLabel>
            <SummaryValue>{isCgstSgst ? money(totals.gstTotal / 2) : ""}</SummaryValue>
          </tr>
          <tr>
            <td colSpan={5} className={`${baseCell} p-[3px] text-[8px] font-bold leading-tight`}>
              <div>* Goods once sold cannot be returned back or exchanged</div>
              <div>* Seller cannot be responsible for any damage/mistakes.</div>
            </td>
            <SummaryLabel>{isCgstSgst ? "Total SGST" : `IGST @ ${gstPercent}%`}</SummaryLabel>
            <SummaryValue>{money(isCgstSgst ? totals.gstTotal / 2 : totals.gstTotal)}</SummaryValue>
          </tr>
          <tr>
            <td colSpan={5} className={baseCell} />
            <SummaryLabel>Total GST</SummaryLabel>
            <SummaryValue>{money(totals.gstTotal)}</SummaryValue>
          </tr>
          <tr>
            <td
              rowSpan={2}
              colSpan={5}
              className={`${baseCell} p-[3px] text-[9px] font-bold leading-tight`}
            >
              <BankDetailsBlock bank={companyBank} />
            </td>
            <SummaryLabel>&nbsp;</SummaryLabel>
            <SummaryValue>&nbsp;</SummaryValue>
          </tr>
          <tr>
            <SummaryLabel>Round Off</SummaryLabel>
            <SummaryValue>{money(Number(record.roundOff ?? 0))}</SummaryValue>
          </tr>
          <tr>
            <td colSpan={5} className={`${baseCell} border-y border-gray-400 p-[3px] align-middle`}>
              <div className="text-[8px]">Amount (in words)</div>
              <b className={times}>{amountInWords(totals.grandTotal)} Only</b>
            </td>
            <SummaryLabel>
              <b>GRAND TOTAL</b>
            </SummaryLabel>
            <SummaryValue>
              <b>{money(totals.grandTotal)}</b>
            </SummaryValue>
          </tr>
          <tr>
            <td colSpan={6} className={`${baseCell} h-[34px] p-[3px]`}>
              Receiver Sign
            </td>
            <td colSpan={5} className={`${baseCell} h-[34px] border-r-0 p-[3px] text-left`}>
              For <b className={times}>{companyName}</b>
            </td>
          </tr>
          <tr>
            <td colSpan={6} className={baseCell} />
            <td colSpan={5} className={`${baseCell} border-r-0 text-left`}>
              Authorised Signatory
            </td>
          </tr>
        </tbody>
      </table>
    </MainPrintTemplate>
  );
}

function SalesPrintItemRow({
  columns,
  index,
  item,
}: {
  readonly columns: readonly SalesPrintColumn[];
  readonly index: number;
  readonly item: SalesItemInput;
}) {
  const taxable = item.quantity * item.rate;
  const gst = (taxable * item.taxRate) / 100;
  return (
    <tr>
      {columns.map((column, columnIndex) => (
        <td
          key={column.id}
          className={`${lineItemCell} ${column.align === "right" ? "text-right" : column.align === "left" ? "text-left" : ""}${columnIndex === columns.length - 1 ? " border-r-0" : ""}`}
        >
          {renderPrintCell(column.id, index, item, taxable, gst)}
        </td>
      ))}
    </tr>
  );
}

function BlankSalesPrintItemRow({ columns }: { readonly columns: readonly SalesPrintColumn[] }) {
  return (
    <tr aria-hidden="true">
      {columns.map((column, columnIndex) => (
        <td
          key={column.id}
          className={`${lineItemCell}${columnIndex === columns.length - 1 ? " border-r-0" : ""}`}
        >
          &nbsp;
        </td>
      ))}
    </tr>
  );
}

function renderPrintCell(
  columnId: SalesPrintColumnId,
  index: number,
  item: SalesItemInput,
  taxable: number,
  gst: number,
) {
  const valueByColumn: Record<SalesPrintColumnId, ReactNode> = {
    areaSq: item.areaSq || "",
    colour: item.colour ?? "",
    dcNo: item.dcNo ?? "",
    description: item.description ?? "",
    gst: money(gst),
    hsnCode: item.hsnCodeId ?? "",
    particulars: printableText(item.productName),
    poNo: item.poNo ?? "",
    price: money(item.rate),
    quantity: item.quantity,
    serialNo: index + 1,
    size: item.size ?? "",
    subTotal: money(taxable + gst),
    taxPercent: item.taxRate,
    taxableAmount: money(taxable),
  };

  if (columnId === "particulars" || columnId === "description") {
    return (
      <div className="overflow-hidden whitespace-pre-line [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
        {valueByColumn[columnId]}
      </div>
    );
  }

  return valueByColumn[columnId];
}

function SummaryLabel({ children }: { readonly children: ReactNode }) {
  return (
    <td
      className={`${baseCell} border-b border-l border-gray-400 p-[3px] text-left text-[10px] align-middle`}
      colSpan={4}
    >
      {children}
    </td>
  );
}

function SummaryValue({ children }: { readonly children: ReactNode }) {
  return (
    <td
      className={`${baseCell} border-b border-r-0 border-gray-400 p-[3px] text-right text-[9px] align-middle`}
      colSpan={2}
    >
      {children}
    </td>
  );
}

function PartyAddressBlock({
  address,
  label,
  partyName,
}: {
  readonly address: string | null;
  readonly label: string;
  readonly partyName: string;
}) {
  const addressLines = normalizedPartyAddress(address);
  const displayPartyName = printableText(partyName);

  return (
    <div className="leading-[1.15]">
      <div>{label}</div>
      <div className="text-[11px] font-bold uppercase tracking-[0.08em]">
        {displayPartyName ? `M/s. ${displayPartyName}` : ""}
      </div>
      {addressLines.map((line) => (
        <div key={`${label}-${line}`} className={times}>
          {line}
        </div>
      ))}
      <div className="grid grid-cols-[74px_8px_1fr]">
        <span>GSTIN/UIN</span>
        <span>:</span>
        <span />
      </div>
      <div className="grid grid-cols-[74px_8px_1fr]">
        <span>State Name</span>
        <span>:</span>
        <span />
      </div>
    </div>
  );
}

function BillDetailsBlock({ record }: { readonly record: SalesRecord }) {
  return (
    <div className="space-y-[1px] leading-[1.35]">
      <BillDetailsLine label="Invoice No:">
        <BillValue strong>{record.documentNo}</BillValue>
      </BillDetailsLine>
      <BillDetailsLine label="Date:">
        <BillValue strong>{formatDate(record.documentDate)}</BillValue>
      </BillDetailsLine>
      <BillDetailsLine label="Reference:">
        <BillValue>{record.referenceNo ?? ""}</BillValue>
      </BillDetailsLine>
    </div>
  );
}

function BillDetailsLine({
  children,
  label,
}: {
  readonly children: ReactNode;
  readonly label: string;
}) {
  return (
    <div className="grid grid-cols-[76px_1fr] gap-[10px]">
      <span className="font-bold">{label}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

function BillValue({
  children,
  strong = false,
}: {
  readonly children: ReactNode;
  readonly strong?: boolean;
}) {
  return (
    <span
      className={`inline-block origin-left scale-x-[1.08] font-mono ${
        strong ? "text-[12px] font-bold" : "text-[10.5px]"
      }`}
    >
      {children}
    </span>
  );
}

function EInvoiceQrSection({ record }: { readonly record: SalesRecord }) {
  return (
    <div className="w-full space-y-[1px] break-words text-[9.5px] font-semibold leading-[1.25] [overflow-wrap:anywhere]">
      <EInvoiceDetailsLine label="IRN :">{record.eInvoiceIrn ?? ""}</EInvoiceDetailsLine>
      <EInvoiceDetailsPair
        leftLabel="Ack No. :"
        leftValue={record.eInvoiceAckNo ?? ""}
        rightLabel="Ack Date :"
        rightValue={record.eInvoiceAckDate ? formatDate(record.eInvoiceAckDate) : ""}
      />
      <EInvoiceDetailsPair
        leftLabel="E-Way Bill No. :"
        leftValue={record.ewayBillNo ?? ""}
        rightLabel="Date :"
        rightValue={record.ewayBillDate ? formatDate(record.ewayBillDate) : ""}
      />
    </div>
  );
}

function EInvoiceDetailsLine({
  children,
  label,
}: {
  readonly children: ReactNode;
  readonly label: string;
}) {
  return (
    <div className="grid grid-cols-[58px_1fr] gap-[8px]">
      <span className="font-bold">{label}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

function EInvoiceDetailsPair({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  readonly leftLabel: string;
  readonly leftValue: ReactNode;
  readonly rightLabel: string;
  readonly rightValue: ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-[12px]">
      <EInvoiceInlineDetail label={leftLabel}>{leftValue}</EInvoiceInlineDetail>
      <EInvoiceInlineDetail label={rightLabel}>{rightValue}</EInvoiceInlineDetail>
    </div>
  );
}

function EInvoiceInlineDetail({
  children,
  label,
}: {
  readonly children: ReactNode;
  readonly label: string;
}) {
  return (
    <span>
      <b>{label}</b> {children}
    </span>
  );
}

function CompanyLogo({
  company,
  companyName,
}: {
  readonly company: CompanyRecord | null;
  readonly companyName: string;
}) {
  const logoUrl = company?.logos.find((logo) => logo.isActive)?.logoUrl.trim();
  if (logoUrl) {
    return <img src={logoUrl} alt={companyName} className="mx-auto max-h-[105px] max-w-[120px] object-contain" />;
  }

  const initials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials ? (
    <div className="inline-flex size-[100px] items-center justify-center rounded-full border-2 border-black text-[32px] font-bold">
      {initials}
    </div>
  ) : null;
}

function EInvoiceQrData({ value }: { readonly value: string | null }) {
  const qrData = printableText(value);
  if (!qrData) return null;

  return (
    <div className="size-full overflow-hidden border border-gray-700 bg-white p-1 text-[6px] leading-[1.05] [overflow-wrap:anywhere]">
      {qrData}
    </div>
  );
}

function BankDetailsBlock({
  bank,
}: {
  readonly bank: CompanyRecord["bankAccounts"][number] | null;
}) {
  const rows = [
    ["ACCOUNT NO", bank?.accountNumber],
    ["IFSC CODE", bank?.ifsc],
    ["BANK NAME", bank?.bankName],
    ["BRANCH", bank?.branch],
  ] as const;

  return (
    <>
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[94px_8px_1fr]">
          <span>{label}</span>
          <span>:</span>
          <span>{printableText(value)}</span>
        </div>
      ))}
    </>
  );
}

type SalesPrintColumnId =
  | "areaSq"
  | "colour"
  | "dcNo"
  | "description"
  | "gst"
  | "hsnCode"
  | "particulars"
  | "poNo"
  | "price"
  | "quantity"
  | "serialNo"
  | "size"
  | "subTotal"
  | "taxPercent"
  | "taxableAmount";

type SalesPrintColumn = {
  readonly align?: "center" | "left" | "right";
  readonly id: SalesPrintColumnId;
  readonly label: string;
  readonly widthClass: string;
};

function getPrintItemColumns(
  industryKind: SalesIndustryKind,
  salesLayout: SalesBillingLayout,
): readonly SalesPrintColumn[] {
  if (industryKind === "garment") {
    return [
      column("serialNo", "S.No", "w-[4%]"),
      column("hsnCode", "HSN Code", "w-[7%]"),
      ...(salesLayout.usePo ? [column("poNo", "PO.No", "w-[6%]")] : []),
      ...(salesLayout.useDc ? [column("dcNo", "DC.No", "w-[6%]")] : []),
      column("particulars", "Particulars", "w-auto", "left"),
      column("description", "Description", "w-[13%]", "left"),
      ...(salesLayout.useSize ? [column("size", "Size", "w-[5%]")] : []),
      ...(salesLayout.useColour ? [column("colour", "Colour", "w-[6%]")] : []),
      ...amountColumns,
    ];
  }

  if (industryKind === "upvc") {
    return [
      column("serialNo", "S.No", "w-[4%]"),
      ...(salesLayout.usePo ? [column("poNo", "PO.No", "w-[6%]")] : []),
      ...(salesLayout.useDc ? [column("dcNo", "DC.No", "w-[6%]")] : []),
      column("particulars", "Particulars", "w-auto", "left"),
      column("description", "Description", "w-[16%]", "left"),
      ...(salesLayout.useSize ? [column("size", "Size", "w-[6%]")] : []),
      ...(salesLayout.useColour ? [column("colour", "Colour", "w-[6%]")] : []),
      column("areaSq", "Area Sq", "w-[7%]", "right"),
      ...amountColumns,
    ];
  }

  return [
    column("serialNo", "S.No", "w-[4.33%]"),
    ...(salesLayout.usePo ? [column("poNo", "PO.No", "w-[6.33%]")] : []),
    ...(salesLayout.useDc ? [column("dcNo", "DC.No", "w-[7.33%]")] : []),
    column("particulars", "Particulars", "w-auto", "left"),
    column("hsnCode", "HSN Code", "w-[7.5%]"),
    ...(salesLayout.useSize ? [column("size", "Size", "w-[5%]")] : []),
    ...(salesLayout.useColour ? [column("colour", "Colour", "w-[6%]")] : []),
    ...amountColumns,
  ];
}

const amountColumns = [
  column("quantity", "Quantity", "w-[6.44%]"),
  column("price", "Price", "w-[8.44%]", "right"),
  column("taxableAmount", "Taxable Amount", "w-[8.33%]", "right"),
  column("taxPercent", "%", "w-[4.4%]"),
  column("gst", "GST", "w-[9.66%]", "right"),
  column("subTotal", "Sub Total", "w-[9.66%]", "right"),
] as const;

function column(
  id: SalesPrintColumnId,
  label: string,
  widthClass: string,
  align: SalesPrintColumn["align"] = "center",
): SalesPrintColumn {
  return { align, id, label, widthClass };
}

function companyAddress(company: CompanyRecord) {
  const address =
    company.addresses.find((item) => item.isDefault && item.isActive) ??
    company.addresses.find((item) => item.isActive) ??
    company.addresses[0];

  return [address?.addressLine1, address?.addressLine2].map(printableText).filter(Boolean);
}

function companyContact(company: CompanyRecord) {
  const phone =
    printableText(company.primaryPhone) ||
    printableText(company.phones.find((item) => item.isPrimary && item.isActive)?.phoneNumber) ||
    printableText(company.phones.find((item) => item.isActive)?.phoneNumber);
  const email =
    printableText(company.primaryEmail) ||
    printableText(company.emails.find((item) => item.isActive)?.email);
  return [
    phone ? `Mobile: ${phone}` : "",
    email ? `Email: ${email}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

function primaryBankAccount(company: CompanyRecord) {
  return (
    company.bankAccounts.find((item) => item.isPrimary && item.isActive) ??
    company.bankAccounts.find((item) => item.isActive) ??
    null
  );
}

function normalizedPartyAddress(value: string | null) {
  return value
    ?.split(/\r?\n|,\s*/)
    .map((line) => line.trim())
    .filter(Boolean) ?? [];
}

function sumQty(items: readonly SalesItemInput[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB").format(date).replaceAll("/", "-");
}

function money(value: number) {
  return Number(value || 0).toFixed(2);
}

function amountInWords(value: number) {
  const rounded = Math.round(value);
  if (rounded === 0) return "Zero";
  return `${rounded.toLocaleString("en-IN")} Rupees`;
}

function printableText(value: string | null | undefined) {
  return value?.trim() ?? "";
}
