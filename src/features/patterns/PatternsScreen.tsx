"use client";

import { BackHeader, Screen } from "@/components/layout";
import { ROUTES } from "@/constants";
import { AmountCards, CoverageCheck, HotWeek, RecurringCharges, UsualHours, usePatterns, WeekVsNormal } from "./PatternsParts";

export function PatternsScreen() {
  const p = usePatterns();
  return (
    <Screen className="lg:hidden">
      <BackHeader backHref={ROUTES.SETTINGS} title="Your patterns" subtitle="What she scores you against." />
      <main className="flex min-h-0 flex-1 flex-col gap-[22px] overflow-y-auto px-[20px] pt-[8px] pb-[24px] *:shrink-0">
        <AmountCards p={p} />
        <UsualHours p={p} />
        <WeekVsNormal p={p} />
        <HotWeek p={p} />
        <RecurringCharges p={p} />
        <CoverageCheck p={p} />
      </main>
    </Screen>
  );
}
