import type { SalesIndustryKind, SalesItemInput } from "../../domain/sales";

export const salesPrintMinimumItemLineBudget = 27;
export const salesPrintMaximumItemLineBudget = 27;

export type SalesPrintLineRow =
  | {
      readonly index: number;
      readonly item: SalesItemInput;
      readonly kind: "item";
      readonly lineCount: number;
    }
  | {
      readonly index: number;
      readonly kind: "blank";
    };

export function getSalesPrintLinePlan(
  items: readonly SalesItemInput[],
  industryKind: SalesIndustryKind,
): {
  readonly requiresTwoPageTemplate: boolean;
  readonly lineBudget: number;
  readonly rows: readonly SalesPrintLineRow[];
  readonly usedLines: number;
} {
  const itemLineCounts = items.map((item) => getSalesItemPrintLineCount(item, industryKind));
  const lineBudget = getSalesPrintLineBudget(itemLineCounts);
  let usedLines = 0;
  let requiresTwoPageTemplate = false;
  const rows: SalesPrintLineRow[] = [];

  items.forEach((item, index) => {
    const lineCount = itemLineCounts[index] ?? 1;
    if (usedLines + lineCount > lineBudget) {
      requiresTwoPageTemplate = true;
      return;
    }

    usedLines += lineCount;
    rows.push({ index, item, kind: "item", lineCount });
  });

  if (!requiresTwoPageTemplate) {
    for (let index = rows.length; usedLines < lineBudget; index += 1) {
      rows.push({ index, kind: "blank" });
      usedLines += 1;
    }
  }

  return { lineBudget, requiresTwoPageTemplate, rows, usedLines };
}

export function getSalesItemPrintLineCount(item: SalesItemInput, industryKind: SalesIndustryKind) {
  if (industryKind === "offset") {
    return Math.max(
      getClampedPrintLineCount(item.poNo ?? "", 6),
      getClampedPrintLineCount(item.dcNo ?? "", 6),
      getClampedPrintLineCount(item.productName, 32),
    );
  }

  if (industryKind === "garment") {
    return Math.max(
      getClampedPrintLineCount(item.productName, 34),
      getClampedPrintLineCount(item.description ?? "", 24),
      getClampedPrintLineCount(item.size ?? "", 8),
      getClampedPrintLineCount(item.colour ?? "", 9),
    );
  }

  return Math.max(
    getClampedPrintLineCount(item.productName, 34),
    getClampedPrintLineCount(item.description ?? "", 30),
    getClampedPrintLineCount(item.size ?? "", 10),
  );
}

export function getClampedPrintLineCount(value: string, charactersPerLine: number, maxLines = 3) {
  const lineCount = value
    .split(/\r?\n/)
    .reduce(
      (sum, line) =>
        sum + Math.max(1, Math.ceil(Array.from(line.trim()).length / charactersPerLine)),
      0,
    );
  return Math.min(maxLines, Math.max(1, lineCount));
}

export function getSalesPrintLineBudget(itemLineCounts: readonly number[]) {
  void itemLineCounts;
  return salesPrintMinimumItemLineBudget;
}
