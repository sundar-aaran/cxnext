export type DummyPrintItem = {
  readonly poNo: string;
  readonly dcNo: string;
  readonly particulars: string;
  readonly hsnCode: string;
  readonly quantity: string;
  readonly price: string;
  readonly taxableAmount: string;
  readonly taxPercent: string;
  readonly gst: string;
  readonly subTotal: string;
};

const dummyProductLines = [
  "100 % COTTON KNIITED DYED FABRIC 24 GG 180 GSM",
  "100 % cotton Mens Round neck with front print",
  "POLY COTTON LOOP KNIT FABRIC 30 GG 220 GSM",
  "LADIES RELAXED FIT T-SHIRT BIO WASHED",
] as const;

const dummyShadeLines = [
  "Shade: Red | Lot: TX-418",
  "Shade: Green | Lot: RN-207",
  "Shade: Navy | Lot: PC-882",
  "Shade: Black | Lot: LW-553",
] as const;

const dummyDetailLines = [
  "Roll packed and checked",
  "Front print with soft hand feel",
  "Reactive dyed compact finish",
  "Export packing with size ratio",
] as const;

export const dummySalesItems: readonly DummyPrintItem[] = Array.from({ length: 13 }, (_, index) => {
  const row = index + 1;
  const baseAmount = 210000 + index * 35750;
  const taxableAmount = baseAmount * ((index % 4) + 1);
  const gst = taxableAmount * 0.18;

  return {
    poNo: `PO-${String(320 + row).padStart(4, "0")}`,
    dcNo: `DC-${String(740 + row).padStart(4, "0")}`,
    particulars: makeDummyParticulars(index),
    hsnCode: String(52081110 + (index % 8) * 101),
    quantity: String(120000 + index * 1739),
    price: money(48.5 + index * 3.25),
    taxableAmount: money(taxableAmount),
    taxPercent: "18",
    gst: money(gst),
    subTotal: money(taxableAmount + gst),
  };
});

function makeDummyParticulars(index: number) {
  const lineCount = index === 12 ? 3 : (index % 3) + 1;
  const lines = [
    dummyProductLines[index % dummyProductLines.length],
    dummyShadeLines[index % dummyShadeLines.length],
    dummyDetailLines[index % dummyDetailLines.length],
  ];

  return lines.slice(0, lineCount).join("\n");
}

function money(value: number) {
  return Number(value || 0).toFixed(2);
}
