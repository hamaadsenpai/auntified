import { Suspense } from "react";
import { PayDesktop, ReviewScreen } from "@/features/pay";

export default function PayReviewPage() {
  return (
    <>
      <PayDesktop />
      {/* ReviewScreen reads ?id with useSearchParams, so it renders on the client under its own boundary. */}
      <Suspense fallback={null}>
        <ReviewScreen />
      </Suspense>
    </>
  );
}
