"use client";

import { BottomNav, Screen } from "@/components/layout";
import { PayeeForm } from "./PayeeForm";
import { PayeesDesktop } from "./PayeesDesktop";
import { PayeeRows, RecentBills, usePayeesList, WhoOwesWhom } from "./usePayeesList";
import { SplitForm } from "./SplitForm";

const H2 = "m-0 mb-[4px] font-display text-[16px] font-bold";
const TOGGLE = "flex min-h-[44px] cursor-pointer items-center text-[15px] font-semibold text-teal";

/** Renders both layouts from one usePayeesList call, so the form toggles and action state are not doubled. */
export function PayeesScreen() {
  const m = usePayeesList();
  return (
    <>
      <PayeesDesktop m={m} />
      <Screen className="lg:hidden">
        <header className="flex flex-none items-center gap-[12px] px-[20px] pt-[16px] pb-[8px]">
          <div className="flex flex-1 flex-col gap-[2px]">
            <h1 className="m-0 font-display text-[22px] leading-[1.1] font-bold">Payees</h1>
            <span className="text-[13px] font-medium text-muted">Records only, no money moves</span>
          </div>
          <button type="button" aria-expanded={m.adding} onClick={() => m.setAdding((a) => !a)} className={TOGGLE}>
            {m.adding ? "Close" : "Add payee"}
          </button>
        </header>
        <main className="flex min-h-0 flex-1 flex-col gap-[20px] overflow-y-auto px-[20px] pt-[4px] pb-[20px] *:shrink-0">
          {m.adding && <PayeeForm submitLabel="Add payee" onSubmit={m.add} onCancel={() => m.setAdding(false)} />}
          <section className="flex flex-col">
            <h2 className={H2}>Your payees</h2>
            <PayeeRows m={m} />
          </section>
          <section className="flex flex-col gap-[8px]">
            <div className="flex items-center justify-between gap-[12px]">
              <h2 className={H2}>Who owes whom</h2>
              <button type="button" aria-expanded={m.splitting} onClick={() => m.setSplitting((s) => !s)} className={TOGGLE}>
                {m.splitting ? "Close" : "Split a bill"}
              </button>
            </div>
            {m.splitting && <SplitForm payees={m.payees.items} onSubmit={m.split} onCancel={() => m.setSplitting(false)} />}
            <WhoOwesWhom m={m} />
          </section>
          {m.bills.items.length > 0 && (
            <section className="flex flex-col">
              <h2 className={H2}>Recent bills</h2>
              <RecentBills m={m} />
            </section>
          )}
        </main>
        <BottomNav active="payees" />
      </Screen>
    </>
  );
}
