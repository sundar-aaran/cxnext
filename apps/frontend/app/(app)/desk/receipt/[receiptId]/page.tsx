import { notFound } from "next/navigation";
import { ReceiptShowPage } from "../../../../../features/receipt/interface/pages/receipt-pages";

export default async function ReceiptShowRoute({
  params,
}: {
  readonly params: Promise<{ receiptId: string }>;
}) {
  const { receiptId } = await params;

  if (!/^\d+$/.test(receiptId)) {
    notFound();
  }

  return <ReceiptShowPage receiptId={Number.parseInt(receiptId, 10)} />;
}
