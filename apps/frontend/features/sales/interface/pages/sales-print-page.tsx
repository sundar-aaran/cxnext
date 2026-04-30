"use client";

import { useMemo, type ReactNode } from "react";
import { calculateSalesTotals } from "../../application/sales-service";
import type { SalesItemInput, SalesRecord } from "../../domain/sales";
import { dummySalesItems, type DummyPrintItem } from "./sales-print-dummy-items";
import { portalQrPath } from "./sales-print-qr";

const company = {
  name: "S K TEX",
  address: ["Tirupur, Tamil Nadu", "India"],
  contact: "Mobile: - | Email: -",
  gstin: "GSTIN: -",
  bank: ["ACCOUNT NO : -", "IFSC CODE : -", "BANK NAME : -", "BRANCH : -"],
};

const tableClass = "w-full border-collapse border border-gray-400";
const baseCell = "border-r border-gray-400 align-top p-[3px]";
const itemCell = `${baseCell} h-[18px] border-b-4 border-double border-gray-400 text-center text-[9px] align-middle`;
const lineItemCell = `${baseCell} h-[18px] text-center text-[9px] leading-[1.08]`;
const totalItemCell = `${lineItemCell} border-y border-gray-400`;
const times = "font-['Times_New_Roman']";

export function SalesInvoiceDocument({ record }: { readonly record: SalesRecord }) {
  const totals = useMemo(
    () => calculateSalesTotals(record.items, Number(record.roundOff ?? 0)),
    [record],
  );
  const gstPercent = record.items[0]?.taxRate ?? 0;
  const isCgstSgst = (record.placeOfSupply ?? "cgst-sgst") !== "igst";

  return (
    <>
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 7mm 4mm 5mm;
        }

        @media print {
          html,
          body {
            width: auto;
            min-height: 297mm;
            margin: 0;
            background: #ffffff !important;
          }

          body {
            display: flex;
            justify-content: center;
          }
        }
      `}</style>
      <section className="mx-auto w-[210mm] max-w-full origin-top bg-white font-[Verdana,Arial,sans-serif] text-[10px] text-black print:mx-auto print:mt-0 print:w-[198mm] print:max-w-none">
        <div className="grid grid-cols-[1fr_auto_1fr] p-px text-[9px]">
          <span />
          <span className="text-[12px] font-bold">TAX INVOICE</span>
          <span className="text-right">Original Copy</span>
        </div>
        <table className={`${tableClass} border-b-0`}>
          <tbody>
            <tr>
              <td className={`${baseCell} h-[160px] w-[145px] border-r-0 text-center align-middle`}>
                <div className="inline-flex size-[100px] items-center justify-center rounded-full border-2 border-black text-[32px] font-bold">
                  SK
                </div>
              </td>
              <td className={`${baseCell} text-center leading-[1.6]`}>
                <div className={`${times} text-[34px] font-bold leading-tight`}>{company.name}</div>
                {company.address.map((line) => (
                  <div key={line} className={times}>
                    {line}
                  </div>
                ))}
                <div className={times}>{company.contact}</div>
                <div className={times}>{company.gstin}</div>
              </td>
              <td className={`${baseCell} w-[160px] border-r-0 align-middle`}>
                <div className="mx-auto flex size-[150px] items-center justify-center p-[2px]">
                  <EInvoiceBarcode className="size-full" />
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
                    <EInvoiceQrSection />
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
        <table className={`${tableClass} border-t-0`}>
          <thead>
            <tr className="bg-gray-50">
              {headers.map((header) => (
                <th key={header.label} className={`${itemCell} ${header.widthClass}`}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dummySalesItems.map((item, index) => (
              <DummyItemRow key={item.poNo} index={index} item={item} />
            ))}
            <tr>
              <td className={`${totalItemCell} text-left`}>E&amp;OE</td>
              <td colSpan={4} className={`${totalItemCell} text-right font-bold`}>
                Total&nbsp;&nbsp;
              </td>
              <td className={totalItemCell}>{sumQty(record.items)}</td>
              <td className={totalItemCell} />
              <td className={`${totalItemCell} text-right`}>{money(totals.taxableAmount)}</td>
              <td colSpan={2} className={`${totalItemCell} text-right`}>
                {money(totals.gstTotal)}
              </td>
              <td className={`${totalItemCell} border-r-0 text-right`}>
                {money(totals.grandTotal)}
              </td>
            </tr>
            <tr>
              <td
                rowSpan={2}
                colSpan={5}
                className={`${baseCell} p-[3px] text-[8px] leading-tight`}
              >
                We hereby certify that our registration under the GST Act 2017 is in force on the
                date on which sale of goods specified in this invoice is made by us and the sale is
                effected in the regular course of business. All disputes are subject to Tirupur
                Jurisdiction Only.
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
              <SummaryValue>
                {money(isCgstSgst ? totals.gstTotal / 2 : totals.gstTotal)}
              </SummaryValue>
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
                {company.bank.slice(0, 4).map((line) => (
                  <div key={line} className="grid grid-cols-[94px_8px_1fr]">
                    <span>{line.split(":")[0]}</span>
                    <span>:</span>
                    <span>{line.split(":")[1]?.trim() ?? ""}</span>
                  </div>
                ))}
              </td>
              <SummaryLabel>&nbsp;</SummaryLabel>
              <SummaryValue>&nbsp;</SummaryValue>
            </tr>
            <tr>
              <SummaryLabel>Round Off</SummaryLabel>
              <SummaryValue>{money(Number(record.roundOff ?? 0))}</SummaryValue>
            </tr>
            <tr>
              <td
                colSpan={5}
                className={`${baseCell} border-y border-gray-400 p-[3px] align-middle`}
              >
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
                For <b className={times}>{company.name}</b>
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
      </section>
    </>
  );
}

function DummyItemRow({ index, item }: { readonly index: number; readonly item: DummyPrintItem }) {
  return (
    <tr>
      <td className={lineItemCell}>{index + 1}</td>
      <td className={lineItemCell}>{item.poNo}</td>
      <td className={lineItemCell}>{item.dcNo}</td>
      <td className={`${lineItemCell} text-left`}>
        <div className="overflow-hidden whitespace-pre-line [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
          {item.particulars}
        </div>
      </td>
      <td className={lineItemCell}>{item.hsnCode}</td>
      <td className={lineItemCell}>{item.quantity}</td>
      <td className={`${lineItemCell} text-right`}>{item.price}</td>
      <td className={`${lineItemCell} text-right`}>{item.taxableAmount}</td>
      <td className={lineItemCell}>{item.taxPercent}</td>
      <td className={`${lineItemCell} text-right`}>{item.gst}</td>
      <td className={`${lineItemCell} border-r-0 text-right`}>{item.subTotal}</td>
    </tr>
  );
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

  return (
    <div className="leading-[1.15]">
      <div>{label}</div>
      <div className="text-[11px] font-bold uppercase tracking-[0.08em]">M/s. {partyName}</div>
      {addressLines.map((line) => (
        <div key={`${label}-${line}`} className={times}>
          {line}
        </div>
      ))}
      <div className="grid grid-cols-[74px_8px_1fr]">
        <span>GSTIN/UIN</span>
        <span>:</span>
        <span>33ACLFA3246K1ZD</span>
      </div>
      <div className="grid grid-cols-[74px_8px_1fr]">
        <span>State Name</span>
        <span>:</span>
        <span>Tamil Nadu, Code : 33</span>
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
        <BillValue>{record.referenceNo ?? "-"}</BillValue>
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

function EInvoiceQrSection() {
  return (
    <div className="w-full space-y-[1px] break-words text-[9.5px] font-semibold leading-[1.25] [overflow-wrap:anywhere]">
      <EInvoiceDetailsLine label="IRN :">
        d0732c714c535f442a986e095c14b891e54abf3c31fee3 41317e39dbca497646
      </EInvoiceDetailsLine>
      <EInvoiceDetailsLine label="Ack No. :">152624292778890</EInvoiceDetailsLine>
      <EInvoiceDetailsLine label="Ack Date :">6-Jan-26</EInvoiceDetailsLine>
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

function EInvoiceBarcode({ className }: { readonly className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`border border-gray-700 bg-white ${className}`}
      shapeRendering="crispEdges"
      viewBox="0 0 49 49"
    >
      <rect width="49" height="49" fill="white" />
      <path d={portalQrPath} fill="black" />
    </svg>
  );
}

const headers = [
  { label: "S.No", widthClass: "w-[4.33%]" },
  { label: "PO.No", widthClass: "w-[6.33%]" },
  { label: "DC.No", widthClass: "w-[7.33%]" },
  { label: "Particulars", widthClass: "w-auto" },
  { label: "HSN Code", widthClass: "w-[7.5%]" },
  { label: "Quantity", widthClass: "w-[6.44%]" },
  { label: "Price", widthClass: "w-[8.44%]" },
  { label: "Taxable Amount", widthClass: "w-[8.33%]" },
  { label: "%", widthClass: "w-[4.4%]" },
  { label: "GST", widthClass: "w-[9.66%]" },
  { label: "Sub Total", widthClass: "w-[9.66%]" },
] as const;

function normalizedPartyAddress(value: string | null) {
  const lines = value?.split(/\r?\n|,\s*/).filter(Boolean) ?? [];
  return lines.length >= 3 ? lines : dummyPartyAddress;
}

const dummyPartyAddress = [
  "SF No. 593, 3rd Street",
  "Anna Nagar Extension, KPN Colony , Near old bus stand",
  "Tirupur - 641602",
] as const;

function sumQty(items: readonly SalesItemInput[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB").format(new Date(value)).replaceAll("/", "-");
}

function money(value: number) {
  return Number(value || 0).toFixed(2);
}

function amountInWords(value: number) {
  const rounded = Math.round(value);
  if (rounded === 0) return "Zero";
  return `${rounded.toLocaleString("en-IN")} Rupees`;
}
