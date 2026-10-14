"use client";

import Link from "next/link";
import { BackIcon } from "@/components/icons";
import { Screen } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Money } from "@/components/ui";
import { ROUTES } from "@/constants";
import { DEMO_FIRE } from "@/constants/demo";
import { ActionButton, DemoBanner, DemoMessage, DemoStats, JumpSelect, ResetControl, resetHint } from "./DemoControls";
import { useDemo } from "./DemoProvider";

export function DemoScreen() {
  const { confirmingReset } = useDemo();
  return (
    <Screen className="lg:hidden">
      <DemoBanner />
      <header className="flex h-[64px] flex-none items-center gap-[6px] pr-[20px] pl-[8px]">
        <Link href={ROUTES.SETTINGS} aria-label="Back" className="flex h-[44px] w-[44px] items-center justify-center rounded-[22px]">
          <BackIcon />
        </Link>
        <h1 className="m-0 flex-1 font-display text-[19px] leading-[1.1] font-bold">Demo controls</h1>
        <AuntieBao mood="sleep" width={44} height={41} />
      </header>
      <main className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto px-[20px] pb-[20px] *:shrink-0">
        <DemoStats className="grid grid-cols-2 gap-[12px] rounded-[16px] border-[1.5px] border-dashed border-slate p-[14px]" />
        <div className="flex flex-col border-t border-line">
          <div className="flex items-center justify-between gap-[12px] border-b border-line py-[14px]">
            <span className="flex flex-col gap-[2px]">
              <span className="text-[16px] font-semibold">Seed 90 days of data</span>
              <span className="text-[13px] font-medium text-muted">Rebuilds ledger, patterns and goal</span>
            </span>
            <ActionButton action="seed">Seed</ActionButton>
          </div>
          <div className="flex items-center justify-between gap-[12px] border-b border-line py-[14px]">
            <span className="flex flex-col gap-[2px]">
              <span className="text-[16px] font-semibold">Fire a scam payment</span>
              <span className="text-[13px] font-medium text-muted">
                <Money sgd={DEMO_FIRE.AMOUNT_SGD} /> to a {DEMO_FIRE.PAYEE_AGE_MIN} minute old payee
              </span>
            </span>
            <ActionButton action="fire">Fire</ActionButton>
          </div>
          <div className="flex flex-col gap-[10px] border-b border-line py-[14px]">
            <span className="flex flex-col gap-[2px]">
              <label htmlFor="jump" className="text-[16px] font-semibold">
                Jump the clock
              </label>
              <span className="text-[13px] font-medium text-muted">Ends cool downs, triggers the next roast</span>
            </span>
            <div className="flex gap-[8px]">
              <JumpSelect id="jump" />
              <ActionButton action="jump">Jump</ActionButton>
            </div>
          </div>
          <div className="flex items-center justify-between gap-[12px] py-[14px]">
            <span className="flex flex-col gap-[2px]">
              <span className="text-[16px] font-semibold">Reset state</span>
              <span className="text-[13px] font-medium text-muted">{resetHint(confirmingReset)}</span>
            </span>
            <ResetControl />
          </div>
        </div>
        <DemoMessage />
      </main>
    </Screen>
  );
}
