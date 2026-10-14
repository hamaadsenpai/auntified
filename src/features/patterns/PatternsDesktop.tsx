"use client";

import Link from "next/link";
import { BackIcon } from "@/components/icons";
import { ROUTES } from "@/constants";
import { AmountCards, CoverageCheck, HotWeek, RecurringCharges, UsualHours, usePatterns, WeekVsNormal } from "./PatternsParts";

const PANEL = "flex flex-col rounded-[24px] border-[2.5px] border-ink px-[24px] py-[20px] shadow-hard-md";

export function PatternsDesktop() {
  const p = usePatterns();
  return (
    <main className="hidden min-h-dvh min-w-0 flex-col gap-[24px] bg-white px-[40px] py-[32px] lg:flex">
      <header className="flex flex-col gap-[2px]">
        <Link href={ROUTES.SETTINGS} className="mb-[8px] flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-semibold text-teal no-underline">
          <BackIcon size={18} />
          Back to settings
        </Link>
        <span className="text-[13px] font-medium text-muted">What she scores you against</span>
        <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">Your patterns</h1>
      </header>
      <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start gap-[24px]">
        <section aria-label="This week vs normal" className={`${PANEL} gap-[16px]`}>
          <WeekVsNormal p={p} variant="desktop" />
          <HotWeek p={p} />
        </section>
        <div className="flex flex-col gap-[24px]">
          <section aria-label="Transfer amounts">
            <AmountCards p={p} variant="desktop" />
          </section>
          <section aria-label="Usual hours" className={PANEL}>
            <UsualHours p={p} variant="desktop" />
          </section>
          <section aria-label="Recurring bills and subscriptions" className={PANEL}>
            <RecurringCharges p={p} variant="desktop" />
          </section>
          <section aria-label="Coverage check" className={PANEL}>
            <CoverageCheck p={p} variant="desktop" />
          </section>
        </div>
      </div>
    </main>
  );
}
