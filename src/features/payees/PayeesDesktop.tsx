"use client";

import { Button } from "@/components/ui";
import { PayeeForm } from "./PayeeForm";
import { PayeeRows, RecentBills, WhoOwesWhom, type PayeesListModel } from "./usePayeesList";
import { SplitForm } from "./SplitForm";

const PANEL = "flex flex-col gap-[16px] rounded-[24px] border-[2.5px] border-ink px-[24px] py-[20px] shadow-hard-md";
const H2 = "m-0 font-display text-[17px] font-bold";

export function PayeesDesktop({ m }: { m: PayeesListModel }) {
  return (
    <main className="hidden min-h-dvh min-w-0 flex-col gap-[24px] bg-white px-[40px] py-[32px] lg:flex">
      <header className="flex items-center gap-[16px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <span className="text-[13px] font-medium text-muted">Records only, no money moves</span>
          <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">Payees</h1>
        </div>
        <Button variant="secondary" className="h-[44px] px-[18px]" aria-expanded={m.splitting} onClick={() => m.setSplitting((s) => !s)}>
          {m.splitting ? "Close" : "Split a bill"}
        </Button>
        <Button variant="secondary" className="h-[44px] px-[18px]" aria-expanded={m.adding} onClick={() => m.setAdding((a) => !a)}>
          {m.adding ? "Close" : "Add payee"}
        </Button>
      </header>
      <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start gap-[24px]">
        <div className="flex flex-col gap-[24px]">
          {m.adding && (
            <section aria-labelledby="dpayees-add-h" className={PANEL}>
              <h2 id="dpayees-add-h" className={H2}>
                Add payee
              </h2>
              <PayeeForm idPrefix="dpayees" submitLabel="Add payee" onSubmit={m.add} onCancel={() => m.setAdding(false)} />
            </section>
          )}
          <section aria-labelledby="dpayees-list-h" className={PANEL}>
            <h2 id="dpayees-list-h" className={H2}>
              Your payees
            </h2>
            <PayeeRows m={m} />
          </section>
        </div>
        <div className="flex flex-col gap-[24px]">
          {m.splitting && (
            <section aria-labelledby="dpayees-split-h" className={PANEL}>
              <h2 id="dpayees-split-h" className={H2}>
                Split a bill
              </h2>
              <SplitForm idPrefix="dsplit" payees={m.payees.items} onSubmit={m.split} onCancel={() => m.setSplitting(false)} />
            </section>
          )}
          <section aria-labelledby="dpayees-owe-h" className={PANEL}>
            <h2 id="dpayees-owe-h" className={H2}>
              Who owes whom
            </h2>
            <WhoOwesWhom m={m} />
          </section>
          {m.bills.items.length > 0 && (
            <section aria-labelledby="dpayees-bills-h" className={PANEL}>
              <h2 id="dpayees-bills-h" className={H2}>
                Recent bills
              </h2>
              <RecentBills m={m} />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
