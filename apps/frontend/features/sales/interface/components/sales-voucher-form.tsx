"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AnimatedTabs, Button, Input, Label, Separator } from "@cxnext/ui";
import { calculateSalesTotals, formatMoney } from "../../application/sales-service";
import {
  defaultSalesItem,
  type SalesInput,
  type SalesItemInput,
  type SalesLookupOption,
} from "../../domain/sales";

export const salesTypeOptions = [
  { label: "CGST-SGST", value: "cgst-sgst" },
  { label: "IGST", value: "igst" },
] as const;

export function SalesVoucherTabs({
  contacts,
  form,
  products,
  setForm,
}: {
  readonly contacts: readonly SalesLookupOption[];
  readonly form: SalesInput;
  readonly products: readonly SalesLookupOption[];
  readonly setForm: (value: SalesInput) => void;
}) {
  const [itemDraft, setItemDraft] = useState<SalesItemInput>(defaultSalesItem());
  const totals = useMemo(
    () => calculateSalesTotals(form.items, form.roundOff),
    [form.items, form.roundOff],
  );

  return (
    <AnimatedTabs
      className="[&>div:first-child]:rounded-md [&>div:first-child]:border-border"
      tabs={[
        {
          value: "details",
          label: "Details",
          content: (
            <DetailsTab
              contacts={contacts}
              form={form}
              itemDraft={itemDraft}
              products={products}
              setForm={setForm}
              setItemDraft={setItemDraft}
              totals={totals}
            />
          ),
        },
        {
          value: "address",
          label: "Address",
          content: <AddressTab form={form} setForm={setForm} />,
        },
        {
          value: "eway",
          label: "E-way Details",
          content: <EwayTab form={form} setForm={setForm} />,
        },
        { value: "terms", label: "Terms", content: <TermsTab form={form} setForm={setForm} /> },
      ]}
    />
  );
}

function DetailsTab({
  contacts,
  form,
  itemDraft,
  products,
  setForm,
  setItemDraft,
  totals,
}: {
  readonly contacts: readonly SalesLookupOption[];
  readonly form: SalesInput;
  readonly itemDraft: SalesItemInput;
  readonly products: readonly SalesLookupOption[];
  readonly setForm: (value: SalesInput) => void;
  readonly setItemDraft: (value: SalesItemInput) => void;
  readonly totals: ReturnType<typeof calculateSalesTotals>;
}) {
  function addItem() {
    if (!itemDraft.productName.trim()) return;
    setForm({
      ...form,
      items: [...form.items, { ...itemDraft, sortOrder: form.items.length + 1 }],
    });
    setItemDraft(defaultSalesItem());
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <LookupField
            label="Contact name"
            options={contacts}
            placeholder="Party Name"
            value={form.partyName}
            onPick={(option) => setForm({ ...form, partyId: option.id, partyName: option.label })}
            onValueChange={(value) => setForm({ ...form, partyName: value })}
          />
          <Field label="Order no">
            <Input
              className="h-11 rounded-md"
              placeholder="Order NO"
              value={form.referenceNo ?? ""}
              onChange={(event) => setForm({ ...form, referenceNo: event.target.value })}
            />
          </Field>
        </div>
        <div className="space-y-5">
          <Field label="Invoice no">
            <Input
              className="h-11 rounded-md"
              value={form.documentNo}
              onChange={(event) => setForm({ ...form, documentNo: event.target.value })}
            />
          </Field>
          <Field label="Date">
            <Input
              className="h-11 rounded-md"
              type="date"
              value={form.documentDate}
              onChange={(event) => setForm({ ...form, documentDate: event.target.value })}
            />
          </Field>
          <Field label="Sales type">
            <select
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.placeOfSupply ?? salesTypeOptions[0].value}
              onChange={(event) => setForm({ ...form, placeOfSupply: event.target.value })}
            >
              {salesTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>
      <section className="space-y-5">
        <h2 className="text-lg font-semibold text-primary underline underline-offset-4">
          Sales Items
        </h2>
        <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr_0.5fr_0.5fr_auto]">
          <LookupField
            label="Product name"
            options={products}
            placeholder="Product Name"
            value={itemDraft.productName}
            onPick={(option) =>
              setItemDraft({ ...itemDraft, productId: option.id, productName: option.label })
            }
            onValueChange={(value) => setItemDraft({ ...itemDraft, productName: value })}
          />
          <Field label="Description">
            <Input
              className="h-11 rounded-md"
              placeholder="description"
              value={itemDraft.description ?? ""}
              onChange={(event) => setItemDraft({ ...itemDraft, description: event.target.value })}
            />
          </Field>
          <Field label="Quantity">
            <Input
              className="h-11 rounded-md"
              min="0"
              type="number"
              value={itemDraft.quantity}
              onChange={(event) =>
                setItemDraft({ ...itemDraft, quantity: Number(event.target.value || 0) })
              }
            />
          </Field>
          <Field label="Price">
            <Input
              className="h-11 rounded-md"
              min="0"
              type="number"
              value={itemDraft.rate}
              onChange={(event) =>
                setItemDraft({ ...itemDraft, rate: Number(event.target.value || 0) })
              }
            />
          </Field>
          <Button type="button" className="mt-6 h-11 rounded-md" onClick={addItem}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
        <SalesItemsTable form={form} setForm={setForm} />
        <TotalsFooter form={form} setForm={setForm} totals={totals} />
      </section>
    </div>
  );
}

function SalesItemsTable({
  form,
  setForm,
}: {
  readonly form: SalesInput;
  readonly setForm: (value: SalesInput) => void;
}) {
  const totals = calculateSalesTotals(form.items, form.roundOff);

  return (
    <div className="overflow-x-auto rounded-md border border-border/70">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead className="bg-muted/45 text-muted-foreground">
          <tr>
            {itemTableHeaders.map((header) => (
              <th
                key={header}
                className="border-b border-border/70 px-3 py-2.5 text-center font-medium"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {form.items.map((item, index) => {
            const taxable = item.quantity * item.rate;
            const gst = (taxable * item.taxRate) / 100;
            return (
              <tr
                key={`${item.productName}-${index}`}
                className="border-b border-border/60 last:border-b-0"
              >
                <td className="px-3 py-2.5 text-center text-muted-foreground">{index + 1}</td>
                <td className="px-3 py-2.5">{item.productName}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{item.description ?? "-"}</td>
                <td className="px-3 py-2.5 text-center">{item.quantity}</td>
                <td className="px-3 py-2.5 text-right">{formatMoney(item.rate)}</td>
                <td className="px-3 py-2.5 text-right">{formatMoney(taxable)}</td>
                <td className="px-3 py-2.5 text-center">{item.taxRate}</td>
                <td className="px-3 py-2.5 text-right">{formatMoney(gst)}</td>
                <td className="px-3 py-2.5 text-right">{formatMoney(taxable + gst)}</td>
                <td className="px-3 py-2.5 text-center">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-full"
                    onClick={() =>
                      setForm({
                        ...form,
                        items: form.items.filter((_, itemIndex) => itemIndex !== index),
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
          <tr className="bg-muted/20 font-medium">
            <td className="px-3 py-2.5 text-center" colSpan={3}>
              TOTALS.
            </td>
            <td className="px-3 py-2.5 text-center">
              {form.items.reduce((sum, item) => sum + item.quantity, 0)}
            </td>
            <td />
            <td className="px-3 py-2.5 text-right">{formatMoney(totals.taxableAmount)}</td>
            <td />
            <td className="px-3 py-2.5 text-right">{formatMoney(totals.gstTotal)}</td>
            <td className="px-3 py-2.5 text-right">{formatMoney(totals.grandTotal)}</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function TotalsFooter({
  form,
  setForm,
  totals,
}: {
  readonly form: SalesInput;
  readonly setForm: (value: SalesInput) => void;
  readonly totals: ReturnType<typeof calculateSalesTotals>;
}) {
  return (
    <div className="ml-auto grid w-full max-w-sm gap-3 text-sm">
      <SummaryRow label="Taxable amount" value={formatMoney(totals.taxableAmount)} />
      <SummaryRow label="GST total" value={formatMoney(totals.gstTotal)} />
      <div className="grid grid-cols-[1fr_auto_8rem] items-center gap-4">
        <span className="font-medium text-muted-foreground">Round off</span>
        <span>:</span>
        <Input
          className="h-9 rounded-md text-right"
          type="number"
          value={form.roundOff}
          onChange={(event) => setForm({ ...form, roundOff: Number(event.target.value || 0) })}
        />
      </div>
      <SummaryRow label="Grand total" value={formatMoney(totals.grandTotal)} strong />
    </div>
  );
}

function AddressTab({
  form,
  setForm,
}: {
  readonly form: SalesInput;
  readonly setForm: (value: SalesInput) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Billing address">
        <Input
          className="h-11 rounded-md"
          value={form.billingAddress ?? ""}
          onChange={(event) => setForm({ ...form, billingAddress: event.target.value })}
        />
      </Field>
      <Field label="Shipping address">
        <Input
          className="h-11 rounded-md"
          value={form.shippingAddress ?? ""}
          onChange={(event) => setForm({ ...form, shippingAddress: event.target.value })}
        />
      </Field>
    </div>
  );
}

function EwayTab({
  form,
  setForm,
}: {
  readonly form: SalesInput;
  readonly setForm: (value: SalesInput) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Due date">
        <Input
          className="h-11 rounded-md"
          type="date"
          value={form.dueDate ?? ""}
          onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
        />
      </Field>
      <Field label="Notes">
        <Input
          className="h-11 rounded-md"
          value={form.notes ?? ""}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
        />
      </Field>
    </div>
  );
}

function TermsTab({
  form,
  setForm,
}: {
  readonly form: SalesInput;
  readonly setForm: (value: SalesInput) => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="Terms">
        <Input
          className="h-11 rounded-md"
          value={form.terms ?? ""}
          onChange={(event) => setForm({ ...form, terms: event.target.value })}
        />
      </Field>
      <Separator />
      <Field label="Status">
        <Input
          className="h-11 rounded-md"
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value })}
        />
      </Field>
    </div>
  );
}

function LookupField({
  label,
  onPick,
  onValueChange,
  options,
  placeholder,
  value,
}: {
  readonly label: string;
  readonly onPick: (option: SalesLookupOption) => void;
  readonly onValueChange: (value: string) => void;
  readonly options: readonly SalesLookupOption[];
  readonly placeholder: string;
  readonly value: string;
}) {
  const listId = `${label.toLowerCase().replace(/\s+/g, "-")}-options`;
  return (
    <Field label={label}>
      <Input
        className="h-11 rounded-md"
        list={listId}
        placeholder={placeholder}
        value={value}
        onBlur={(event) => {
          const selected = options.find((option) => option.label === event.target.value);
          if (selected) onPick(selected);
        }}
        onChange={(event) => onValueChange(event.target.value)}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option.id} value={option.label}>
            {option.secondaryLabel ?? option.label}
          </option>
        ))}
      </datalist>
    </Field>
  );
}

function Field({
  children,
  label,
}: {
  readonly children: React.ReactNode;
  readonly label: string;
}) {
  return (
    <Label className="grid gap-2 text-sm font-medium text-muted-foreground">
      <span>{label}</span>
      {children}
    </Label>
  );
}

function SummaryRow({
  label,
  strong = false,
  value,
}: {
  readonly label: string;
  readonly strong?: boolean;
  readonly value: string;
}) {
  return (
    <div
      className={
        strong
          ? "grid grid-cols-[1fr_auto_8rem] gap-4 font-semibold"
          : "grid grid-cols-[1fr_auto_8rem] gap-4"
      }
    >
      <span className="text-muted-foreground">{label}</span>
      <span>:</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

const itemTableHeaders = [
  "#",
  "Items",
  "Description",
  "Quantity",
  "Rate",
  "Taxable",
  "GST Percent",
  "GST",
  "Sub Total",
  "Action",
] as const;
