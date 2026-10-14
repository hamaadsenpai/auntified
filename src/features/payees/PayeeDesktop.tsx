"use client";

import Link from "next/link";
import { BackIcon } from "@/components/icons";
import { Avatar, Button } from "@/components/ui";
import { ROUTES } from "@/constants";
import { PayeeForm } from "./PayeeForm";
import { RequestForm } from "./RequestForm";
import { initials, PastAttempts, PayeeBalance, PayeeError, type PayeeModel } from "./usePayee";

const PANEL = "flex flex-col rounded-[24px] border-[2.5px] border-ink px-[24px] py-[20px] shadow-hard-md";
const MAIN = "hidden min-h-dvh min-w-0 flex-col gap-[24px] bg-white px-[40px] py-[32px] lg:flex";

const backLink = (
  <Link href={ROUTES.PAYEES} className="flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-semibold text-teal no-underline">
    <BackIcon size={18} />
    Back to payees
  </Link>
);

export function PayeeDesktop({ m }: { m: PayeeModel }) {
  const { payee } = m;

  if (!payee) {
    return (
      <main className={MAIN}>
        {backLink}
        <header className="flex flex-col gap-[2px]">
          <span className="text-[13px] font-medium text-muted">Payee</span>
          <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">{m.notFound ? "We could not find this payee." : "Loading…"}</h1>
        </header>
      </main>
    );
  }

  return (
    <main className={MAIN}>
      {backLink}
      <header className="flex items-center gap-[16px]">
        <Avatar initials={initials(payee.name)} size={64} as="div" className="flex-none bg-track text-[22px] text-teal" />
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <span className="text-[13px] font-medium text-muted">Payee · {payee.account}</span>
          <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">{payee.name}</h1>
        </div>
        <Button variant="secondary" className="h-[44px] px-[18px]" aria-expanded={m.requesting} onClick={() => m.setRequesting((r) => !r)}>
          {m.requesting ? "Close request" : "Request money"}
        </Button>
        <Button variant="secondary" className="h-[44px] px-[18px]" aria-expanded={m.editing} onClick={() => m.setEditing((e) => !e)}>
          {m.editing ? "Close" : "Edit payee"}
        </Button>
      </header>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-start gap-[24px]">
        <div className="flex flex-col gap-[24px]">
          {m.requesting && (
            <section aria-labelledby="dpayee-request-h" className={`${PANEL} gap-[16px]`}>
              <h2 id="dpayee-request-h" className="m-0 font-display text-[17px] font-bold">
                Request money
              </h2>
              <RequestForm idPrefix="drequest" payeeId={m.id} name={payee.name} onDone={() => m.setRequesting(false)} />
            </section>
          )}
          {m.editing && (
            <section aria-labelledby="dpayee-edit-h" className={`${PANEL} gap-[16px]`}>
              <h2 id="dpayee-edit-h" className="m-0 font-display text-[17px] font-bold">
                Edit payee
              </h2>
              <PayeeForm
                idPrefix="dpayee"
                initial={{ name: payee.name, account: payee.account, note: payee.note }}
                submitLabel="Save payee"
                onSubmit={m.save}
                onCancel={() => m.setEditing(false)}
              />
            </section>
          )}
          <section aria-labelledby="dpayee-details-h" className={`${PANEL} gap-[16px]`}>
            <h2 id="dpayee-details-h" className="m-0 font-display text-[17px] font-bold">
              Details
            </h2>
            <dl className="m-0 grid grid-cols-2 gap-[10px]">
              {m.stats.map((stat) => (
                <div key={stat.term} className="flex flex-col gap-[2px] rounded-[14px] border border-line-strong px-[14px] py-[12px]">
                  <dt className="text-[12px] font-medium text-muted">{stat.term}</dt>
                  <dd className="m-0 font-display text-[18px] font-bold">{stat.value}</dd>
                </div>
              ))}
              <div className="col-span-full flex items-center justify-between gap-[12px] rounded-[14px] border-[1.5px] border-night px-[14px] py-[12px]">
                <dt className="text-[14px] font-semibold">Flagged before</dt>
                <dd className="m-0 font-display text-[16px] font-bold">{payee.reported ? "Yes, you reported them" : "No"}</dd>
              </div>
            </dl>
            <PayeeError error={m.error} />
            <div className="flex gap-[12px] border-t border-line pt-[16px]">
              <Button className="flex-1 disabled:opacity-60" disabled={m.pending !== null} onClick={m.toggleReport}>
                {m.pending === "report" ? "Saving…" : payee.reported ? "Undo report" : "Report this payee"}
              </Button>
              <Button variant="secondary" className="flex-1 disabled:opacity-60" disabled={m.pending !== null} onClick={m.remove}>
                {m.pending === "remove" ? "Removing…" : "Remove payee"}
              </Button>
            </div>
          </section>
        </div>
        <div className="flex flex-col gap-[24px]">
          <div className={PANEL}>
            <PayeeBalance m={m} variant="desktop" />
          </div>
          <div className={PANEL}>
            <PastAttempts m={m} variant="desktop" />
          </div>
        </div>
      </div>
    </main>
  );
}
