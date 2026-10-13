import { Suspense } from "react";
import { WarnScreen } from "@/features/verdicts";

export default function WarnPage() {
  return (
    <Suspense>
      <WarnScreen />
    </Suspense>
  );
}
