import { Suspense } from "react";
import { BlockedScreen } from "@/features/verdicts";

export default function BlockedPage() {
  return (
    <Suspense>
      <BlockedScreen />
    </Suspense>
  );
}
