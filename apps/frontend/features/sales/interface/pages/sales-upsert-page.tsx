"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  MasterListPageFrame,
  MasterListUpsertCard,
  MasterListUpsertLayout,
  SavePrintButtons,
  useGlobalLoader,
} from "@cxnext/ui";
import {
  getSales,
  listSalesContactLookups,
  listSalesProductLookups,
  prepareSalesInput,
  upsertSales,
} from "../../application/sales-service";
import { listCompanies } from "../../../company/application/company-service";
import { defaultSalesInput, type SalesInput, type SalesLookupOption } from "../../domain/sales";
import { SalesVoucherTabs, salesTypeOptions } from "../components/sales-voucher-form";

export function SalesUpsertPage({ salesId }: { readonly salesId?: number }) {
  const router = useRouter();
  const { show } = useGlobalLoader();
  const isEdit = Boolean(salesId);
  const [form, setForm] = useState<SalesInput>(createSalesVoucherInput());
  const [contacts, setContacts] = useState<readonly SalesLookupOption[]>([]);
  const [industryName, setIndustryName] = useState<string | null>(null);
  const [products, setProducts] = useState<readonly SalesLookupOption[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    void listSalesContactLookups({ signal: controller.signal })
      .then(setContacts)
      .catch((error) => {
        if (isAbortError(error)) return;
        setContacts([]);
      });
    void listSalesProductLookups({ signal: controller.signal })
      .then(setProducts)
      .catch((error) => {
        if (isAbortError(error)) return;
        setProducts([]);
      });
    void listCompanies({ signal: controller.signal })
      .then((companies) => {
        if (controller.signal.aborted) return;
        const company = companies.find((item) => item.isPrimary) ?? companies[0] ?? null;
        setIndustryName(company?.industryName ?? null);
      })
      .catch((error) => {
        if (isAbortError(error)) return;
        setIndustryName(null);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!salesId) return;
    const hide = show();
    void getSales(salesId)
      .then((record) => {
        if (!record) return;
        setForm({
          ...defaultSalesInput(),
          ...record,
          documentDate: record.documentDate.slice(0, 10),
          ewayBillDate: record.ewayBillDate ? record.ewayBillDate.slice(0, 10) : null,
          placeOfSupply: record.placeOfSupply ?? salesTypeOptions[0].value,
        });
      })
      .finally(hide);
  }, [salesId, show]);

  async function save(printAfterSave = false) {
    const hide = show();
    try {
      const saved = await upsertSales(prepareSalesInput(form), salesId);
      toast.success(isEdit ? "Sales updated" : "Sales created");
      if (printAfterSave) {
        router.push(`/desk/sales/${saved.id}?print=1`);
        return;
      }
      router.push(`/desk/sales/${saved.id}`);
    } catch (error) {
      toast.error("Could not save sales", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      hide();
    }
  }

  return (
    <MasterListPageFrame
      description="Create a tabbed sales voucher with item-level GST totals."
      technicalName="page.entries.sales.upsert"
      title={isEdit ? "Edit sales" : "New sales"}
    >
      <MasterListUpsertLayout>
        <MasterListUpsertCard className="overflow-hidden p-0">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <div className="p-4 md:p-5">
              <SalesVoucherTabs
                contacts={contacts}
                form={form}
                industryName={industryName}
                products={products}
                setForm={setForm}
              />
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-border/70 bg-muted/20 px-4 py-4 md:px-6">
              <Button asChild type="button" variant="outline" className="rounded-xl">
                <Link href={salesId ? `/desk/sales/${salesId}` : "/desk/sales"}>
                  <ArrowLeft className="size-4" />
                  Back
                </Link>
              </Button>
              <SavePrintButtons saveLabel="Save" onSavePrint={() => void save(true)} />
            </div>
          </form>
        </MasterListUpsertCard>
      </MasterListUpsertLayout>
    </MasterListPageFrame>
  );
}

function createSalesVoucherInput(): SalesInput {
  return { ...defaultSalesInput(), items: [], placeOfSupply: salesTypeOptions[0].value };
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}
