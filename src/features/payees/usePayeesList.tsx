"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Avatar, Money, Tag } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useBills, useBillsStore, usePayees, usePayeesStore, type LoadStatus } from "@/store";
import type { Bill, CreateBill, Party } from "@/types/bill";
import { cn, errorMessage } from "@/utils";
import { balances, type Debt } from "./balances";
import { settleUp } from "./settle";
import { initials } from "./usePayee";

/** Payees, who owes whom and recent bills, with the add, split, settle and delete actions. Shared by the mobile and desktop screens. */
export function usePayeesList() {
  const payees = usePayees();
  const bills = useBills();
  const [adding, setAdding] = useState(false);
  const [splitting, setSplitting] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const debts = useMemo(() => balances(bills.items), [bills.items]);
  // Each payee's open balance with you: positive when they owe you.
  const withMe = new Map<Party, number>();
  for (const d of debts) {
    if (d.to === "me") withMe.set(d.from, d.amountSgd);
    if (d.from === "me") withMe.set(d.to, -d.amountSgd);
  }

  async function add(body: { name: string; account: string; note: string }) {
    await usePayeesStore.getState().create(body);
    setAdding(false);
  }

  async function split(body: CreateBill) {
    await useBillsStore.getState().create(body);
    setSplitting(false);
  }

  function settle(d: Debt) {
    setPending(`settle:${d.from}|${d.to}`);
    settleUp(d.from, d.to)
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setPending(null));
  }

  function removeBill(bill: Bill) {
    if (!window.confirm(`Delete "${bill.title}"? This removes the record only.`)) return;
    setPending(`delete:${bill.id}`);
    useBillsStore
      .getState()
      .remove(bill.id)
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setPending(null));
  }

  return { payees, bills, debts, withMe, adding, setAdding, splitting, setSplitting, pending, add, split, settle, removeBill };
}

export type PayeesListModel = ReturnType<typeof usePayeesList>;

type Loadable = { status: LoadStatus; error: string | null; load: (force?: boolean) => Promise<void> };

/** Loading text, or the load error with a retry, until the collection is ready. */
function Loaded({ c, children }: { c: Loadable; children: ReactNode }) {
  if (c.status === "error") {
    return (
      <p className="m-0 py-[8px] text-[14px] font-medium text-muted">
        {c.error}{" "}
        <button type="button" onClick={() => void c.load(true)} className="cursor-pointer font-semibold text-teal">
          Retry
        </button>
      </p>
    );
  }
  if (c.status !== "ready") return <p className="m-0 py-[8px] text-[14px] font-medium text-muted">Loading…</p>;
  return children;
}

const row = (last: boolean) => cn("flex min-h-[64px] items-center gap-[12px] py-[8px]", !last && "border-b border-line");

export function PayeeRows({ m }: { m: PayeesListModel }) {
  const { items } = m.payees;
  return (
    <Loaded c={m.payees}>
      {items.length === 0 ? (
        <p className="m-0 py-[8px] text-[14px] font-medium text-muted">No payees yet. Add the people you pay or split bills with.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {items.map((p, i) => {
            const owed = m.withMe.get(p.id);
            return (
              <li key={p.id}>
                <Link href={ROUTES.PAYEE(p.id)} className={cn(row(i === items.length - 1), "text-night no-underline")}>
                  <Avatar initials={initials(p.name)} size={40} className="flex-none bg-track text-[14px] text-teal" />
                  <span className="flex min-w-0 flex-1 flex-col gap-[1px]">
                    <span className="truncate text-[15px] font-semibold">{p.name}</span>
                    <span className="truncate text-[13px] font-medium text-muted">{p.account}</span>
                  </span>
                  {p.reported && <Tag variant="blocked">Reported</Tag>}
                  {owed !== undefined && (
                    <span className={cn("text-right text-[13px] font-semibold", owed > 0 ? "text-teal" : "text-brick")}>
                      {owed > 0 ? "Owes you " : "You owe "}
                      <Money sgd={Math.abs(owed)} />
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Loaded>
  );
}

/** "Mum owes you S$20", with "you" for the signed-in user. */
function debtText(d: Debt) {
  if (d.from === "me") return `You owe ${d.toName} `;
  return `${d.fromName} owes ${d.to === "me" ? "you" : d.toName} `;
}

export function WhoOwesWhom({ m }: { m: PayeesListModel }) {
  return (
    <Loaded c={m.bills}>
      {m.debts.length === 0 ? (
        <p className="m-0 py-[8px] text-[14px] font-medium text-muted">Everyone is square.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {m.debts.map((d, i) => (
            <li key={`${d.from}|${d.to}`} className={row(i === m.debts.length - 1)}>
              <span className="flex-1 text-[15px] font-medium">
                {debtText(d)}
                <span className="font-semibold">
                  <Money sgd={d.amountSgd} />
                </span>
              </span>
              <button
                type="button"
                disabled={m.pending !== null}
                onClick={() => m.settle(d)}
                aria-label={`Settle up: ${debtText(d).trim()}`}
                className="min-h-[44px] cursor-pointer text-[14px] font-semibold text-teal disabled:cursor-default disabled:opacity-60"
              >
                {m.pending === `settle:${d.from}|${d.to}` ? "Settling…" : "Settle up"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Loaded>
  );
}

export function RecentBills({ m }: { m: PayeesListModel }) {
  const { items } = m.bills;
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {items.map((b, i) => {
        const open = b.shares.filter((s) => !s.settledAt).length;
        return (
          <li key={b.id} className={row(i === items.length - 1)}>
            <span className="flex min-w-0 flex-1 flex-col gap-[1px]">
              <span className="truncate text-[15px] font-semibold">{b.title}</span>
              <span className="text-[13px] font-medium text-muted">
                <Money sgd={b.totalSgd} />, {b.paidByName} paid, {open ? `${open} of ${b.shares.length} open` : "settled"}
              </span>
            </span>
            <Tag variant="outline">{b.kind === "request" ? "Request" : "Split"}</Tag>
            <button
              type="button"
              disabled={m.pending !== null}
              onClick={() => m.removeBill(b)}
              aria-label={`Delete ${b.title}`}
              className="min-h-[44px] cursor-pointer text-[12px] font-semibold text-brick disabled:cursor-default disabled:opacity-60"
            >
              {m.pending === `delete:${b.id}` ? "Deleting…" : "Delete"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
