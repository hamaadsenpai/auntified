"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BackIcon } from "@/components/icons";
import { AuntieBao } from "@/components/mascot";
import { Money } from "@/components/ui";
import { ROUTES } from "@/constants";
import { DEMO_FIRE } from "@/constants/demo";
import { ActionButton, DemoBanner, DemoMessage, DemoStats, JumpSelect, ResetControl, resetHint } from "./DemoControls";
import { useDemo } from "./DemoProvider";

const PANEL = "flex flex-col gap-[14px] rounded-[24px] border-[2.5px] border-ink px-[24px] py-[20px] shadow-hard-md";

function ActionPanel({ id, title, hint, children }: { id: string; title: ReactNode; hint: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={PANEL}>
      <div className="flex flex-col gap-[4px]">
        <h2 id={id} className="m-0 font-display text-[17px] font-bold">
          {title}
        </h2>
        <span className="text-[14px] font-medium text-muted">{hint}</span>
      </div>
      <div className="mt-auto flex items-center gap-[10px]">{children}</div>
    </section>
  );
}

export function DemoDesktop() {
  const { confirmingReset } = useDemo();
  return (
    <main className="hidden min-h-dvh min-w-0 flex-col gap-[24px] bg-white px-[40px] py-[32px] lg:flex">
      <DemoBanner className="rounded-[14px]" />
      <header className="flex items-end justify-between gap-[16px]">
        <div className="flex flex-col gap-[2px]">
          <Link href={ROUTES.SETTINGS} className="flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-semibold text-teal no-underline">
            <BackIcon size={18} />
            Settings
          </Link>
          <span className="text-[13px] font-medium text-muted">Set the stage before a walkthrough</span>
          <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">Demo controls</h1>
        </div>
        <AuntieBao mood="sleep" width={72} height={67} />
      </header>
      <section aria-labelledby="dstate-h" className={PANEL}>
        <h2 id="dstate-h" className="m-0 font-display text-[17px] font-bold">
          Current state
        </h2>
        <DemoStats className="grid grid-cols-4 gap-[16px]" itemClassName="rounded-[16px] border-[1.5px] border-dashed border-slate px-[16px] py-[12px]" />
      </section>
      <div className="grid grid-cols-2 gap-[24px]">
        <ActionPanel id="dseed-h" title="Seed 90 days of data" hint="Rebuilds ledger, patterns and goal. Replaces any earlier demo data.">
          <ActionButton action="seed">Seed</ActionButton>
        </ActionPanel>
        <ActionPanel
          id="dfire-h"
          title="Fire a scam payment"
          hint={
            <>
              <Money sgd={DEMO_FIRE.AMOUNT_SGD} /> to a {DEMO_FIRE.PAYEE_AGE_MIN} minute old payee, then watch Auntie&apos;s check
            </>
          }
        >
          <ActionButton action="fire">Fire</ActionButton>
        </ActionPanel>
        <ActionPanel id="djump-h" title={<label htmlFor="djump">Jump the clock</label>} hint="Ends cool downs, triggers the next roast">
          <JumpSelect id="djump" />
          <ActionButton action="jump">Jump</ActionButton>
        </ActionPanel>
        <ActionPanel id="dreset-h" title="Reset state" hint={resetHint(confirmingReset)}>
          <ResetControl />
        </ActionPanel>
      </div>
      <DemoMessage />
    </main>
  );
}
