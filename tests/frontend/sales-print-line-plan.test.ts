import { describe, expect, it } from "vitest";
import {
  getClampedPrintLineCount,
  getSalesItemPrintLineCount,
  getSalesPrintLinePlan,
  salesPrintMaximumItemLineBudget,
  salesPrintMinimumItemLineBudget,
} from "../../apps/frontend/features/sales/interface/pages/sales-print-line-plan";
import type { SalesItemInput } from "../../apps/frontend/features/sales/domain/sales";

describe("sales print line plan", () => {
  it("counts PO and DC using six characters per printed line", () => {
    expect(getClampedPrintLineCount("1777530408909+1234", 6)).toBe(3);
  });

  it("counts the long E2E product smoke name in particulars", () => {
    expect(getClampedPrintLineCount("E2E Product Smoke 1777530408909+1234", 32)).toBe(2);
  });

  it("subtracts wrapped item lines from the fixed single page budget", () => {
    const item = dummySalesItem({
      dcNo: "1777530408909+1234",
      poNo: "1777530408909+1234",
      productName: "E2E Product Smoke 1777530408909+1234",
    });

    expect(getSalesItemPrintLineCount(item, "offset")).toBe(3);

    const plan = getSalesPrintLinePlan([item], "offset");
    const blankRows = plan.rows.filter((row) => row.kind === "blank");

    expect(plan.requiresTwoPageTemplate).toBe(false);
    expect(plan.lineBudget).toBe(salesPrintMinimumItemLineBudget);
    expect(plan.usedLines).toBe(salesPrintMinimumItemLineBudget);
    expect(blankRows).toHaveLength(salesPrintMinimumItemLineBudget - 3);
  });

  it("keeps simple invoices inside the same page-fit budget", () => {
    const plan = getSalesPrintLinePlan(
      [dummySalesItem({ productName: "Short product" })],
      "offset",
    );
    const blankRows = plan.rows.filter((row) => row.kind === "blank");

    expect(plan.lineBudget).toBe(salesPrintMinimumItemLineBudget);
    expect(blankRows).toHaveLength(salesPrintMinimumItemLineBudget - 1);
  });

  it("keeps SAL-LINE-005 calibrated at seven item lines and twenty blanks", () => {
    const plan = getSalesPrintLinePlan(
      [
        dummySalesItem({
          dcNo: "DC00001",
          poNo: "PO00001",
          productName: "Aster Linen Shirt",
        }),
        dummySalesItem({
          dcNo: "DC00002",
          poNo: "PO00002",
          productName:
            "Luna Utility Tote Packed with reinforced handle and inner zip pocket Shade: Natural Black",
        }),
        dummySalesItem({
          dcNo: "DC00003",
          poNo: "PO00003",
          productName: "Aster Linen Shirt - Seed sale line.",
        }),
      ],
      "offset",
    );
    const itemRows = plan.rows.filter((row) => row.kind === "item");
    const blankRows = plan.rows.filter((row) => row.kind === "blank");
    const itemLines = itemRows.reduce((total, row) => total + row.lineCount, 0);

    expect(plan.lineBudget).toBe(27);
    expect(itemLines).toBe(7);
    expect(blankRows).toHaveLength(20);
  });
});

function dummySalesItem(patch: Partial<SalesItemInput> = {}): SalesItemInput {
  return {
    areaSq: 0,
    colour: null,
    dcNo: null,
    description: null,
    discountAmount: 0,
    discountType: null,
    discountValue: 0,
    freeQuantity: 0,
    hsnCodeId: "hsn:default",
    isActive: true,
    mrp: 0,
    poNo: null,
    productId: null,
    productName: "Dummy product",
    productSku: null,
    quantity: 1,
    rate: 100,
    size: null,
    sortOrder: 1,
    taxAmount: 18,
    taxId: "tax:gst",
    taxRate: 18,
    unitId: "unit:piece",
    ...patch,
  };
}
