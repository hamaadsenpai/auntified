"use client";

import Link from "next/link";
import { BackHeader, Screen } from "@/components/layout";
import { Avatar, Button, Card } from "@/components/ui";
import { ROUTES } from "@/constants";
import { PayeeDesktop } from "./PayeeDesktop";
import { PayeeForm } from "./PayeeForm";
import { RequestForm } from "./RequestForm";
import { initials, PastAttempts, PayeeBalance, usePayee } from "./usePayee";

/** Renders both layouts from one usePayee call, so the fallback fetch and the action state are not doubled. */
export function PayeeScreen({ id }: { id: string }) {
  const m = usePayee(id);
  const { payee } = m;

  if (!payee) {
    return (
      <>
        <PayeeDesktop m={m} />
        <Screen className="lg:hidden">
          <BackHeader backHref={ROUTES.PAYEES} title="Payee" />
          <main className="flex flex-1 flex-col items-center justify-center gap-[12px] px-[20px] text-center">
            {m.notFound ? (
              <>
                <p className="m-0 font-display text-[18px] font-bold">We could not find this payee.</p>
                <Link href={ROUTES.PAYEES} className="text-[15px] font-semibold text-teal">
                  Back to payees
                </Link>
              </>
            ) : (
              <p className="m-0 text-[14px] font-medium text-muted">Loading…</p>
            )}
          </main>
        </Screen>
      </>
    );
  }

  return (
    <>
      <PayeeDesktop m={m} />
      <Screen className="lg:hidden">
        <BackHeader backHref={ROUTES.PAYEES} title="Payee">
          <button
            type="button"
            aria-expanded={m.editing}
            onClick={() => m.setEditing((e) => !e)}
            className="ml-auto flex min-h-[44px] cursor-pointer items-center text-[15px] font-semibold text-teal"
          >
            {m.editing ? "Close" : "Edit payee"}
          </button>
        </BackHeader>
        <main className="flex min-h-0 flex-1 flex-col gap-[20px] overflow-y-auto px-[20px] pt-[4px] pb-[20px] *:shrink-0">
          <div className="flex items-center gap-[14px]">
            <Avatar initials={initials(payee.name)} size={56} as="div" className="flex-none bg-track text-[19px] text-teal" />
            <div className="flex flex-col gap-[2px]">
              <span className="font-display text-[24px] leading-[1.1] font-bold">{payee.name}</span>
              <span className="text-[14px] font-medium text-muted">{payee.account}</span>
            </div>
          </div>
          <Button variant="secondary" aria-expanded={m.requesting} onClick={() => m.setRequesting((r) => !r)}>
            {m.requesting ? "Close request" : "Request money"}
          </Button>
          {m.requesting && <RequestForm payeeId={id} name={payee.name} onDone={() => m.setRequesting(false)} />}
          {m.editing && (
            <PayeeForm
              initial={{ name: payee.name, account: payee.account, note: payee.note }}
              submitLabel="Save payee"
              onSubmit={m.save}
              onCancel={() => m.setEditing(false)}
            />
          )}
          <dl className="m-0 grid grid-cols-[1fr_1fr] gap-[10px]">
            {m.stats.map((stat) => (
              <Card key={stat.term} className="flex flex-col gap-[2px] px-[12px] py-[10px]">
                <dt className="text-[12px] font-medium text-muted">{stat.term}</dt>
                <dd className="m-0 font-display text-[16px] font-bold">{stat.value}</dd>
              </Card>
            ))}
            <div className="col-span-full flex items-center justify-between gap-[12px] rounded-[14px] border-[1.5px] border-night px-[12px] py-[10px]">
              <dt className="text-[14px] font-semibold">Flagged before</dt>
              <dd className="m-0 font-display text-[16px] font-bold">{payee.reported ? "Yes, you reported them" : "No"}</dd>
            </div>
          </dl>
          <PayeeBalance m={m} />
          <PastAttempts m={m} />
        </main>
        <div className="flex flex-none flex-col gap-[10px] px-[20px] pt-[12px] pb-[24px]">
          <Button className="disabled:opacity-60" disabled={m.pending !== null} onClick={m.toggleReport}>
            {m.pending === "report" ? "Saving…" : payee.reported ? "Undo report" : "Report this payee"}
          </Button>
          <Button variant="secondary" className="disabled:opacity-60" disabled={m.pending !== null} onClick={m.remove}>
            {m.pending === "remove" ? "Removing…" : "Remove payee"}
          </Button>
        </div>
      </Screen>
    </>
  );
}
