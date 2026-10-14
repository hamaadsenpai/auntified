import { Suspense } from "react";
import { ScanScreen } from "@/features/scan";

export default function ScanPage() {
  return (
    <Suspense>
      <ScanScreen />
    </Suspense>
  );
}
