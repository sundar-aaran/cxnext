import { notFound } from "next/navigation";
import { PaymentShowPage } from "../../../../../features/payment/interface/pages/payment-pages";

export default async function PaymentShowRoute({
  params,
}: {
  readonly params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;

  if (!/^\d+$/.test(paymentId)) {
    notFound();
  }

  return <PaymentShowPage paymentId={Number.parseInt(paymentId, 10)} />;
}
