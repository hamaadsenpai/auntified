import { Suspense } from "react";
import { CheckDesktop, CheckScreen, QuickCheckProvider } from "@/features/pay";

export default function PayCheckPage() {
  return (
    // QuickCheckProvider reads ?id with useSearchParams, so the check renders on the client under this boundary.
    <Suspense fallback={null}>
      <QuickCheckProvider>
        <CheckDesktop />
        <CheckScreen />
      </QuickCheckProvider>
    </Suspense>
  );
}
