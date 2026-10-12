import { notFound } from "next/navigation";
import { PAYEE_IDS, PayeeScreen } from "@/features/payees";

export function generateStaticParams() {
  return PAYEE_IDS.map((id) => ({ id }));
}

export default async function PayeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!PAYEE_IDS.includes(id)) notFound();
  return <PayeeScreen />;
}
