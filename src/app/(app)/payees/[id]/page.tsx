import { Suspense } from "react";
import { PayeeScreen } from "@/features/payees";

export default function PayeePage({ params }: { params: Promise<{ id: string }> }) {
  // The id is only known at request time, so it resolves inside Suspense.
  return <Suspense>{params.then(({ id }) => <PayeeScreen id={id} />)}</Suspense>;
}
