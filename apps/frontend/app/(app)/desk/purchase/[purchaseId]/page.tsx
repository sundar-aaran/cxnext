import { notFound } from "next/navigation";
import { PurchaseShowPage } from "../../../../../features/purchase/interface/pages/purchase-pages";

export default async function PurchaseShowRoute({
  params,
}: {
  readonly params: Promise<{ purchaseId: string }>;
}) {
  const { purchaseId } = await params;

  if (!/^\d+$/.test(purchaseId)) {
    notFound();
  }

  return <PurchaseShowPage purchaseId={Number.parseInt(purchaseId, 10)} />;
}
