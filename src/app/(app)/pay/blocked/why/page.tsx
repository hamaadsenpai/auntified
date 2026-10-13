import { Suspense } from "react";
import { ScoreScreen } from "@/features/verdicts";

export default function ScorePage() {
  return (
    <Suspense>
      <ScoreScreen />
    </Suspense>
  );
}
