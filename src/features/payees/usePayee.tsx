"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button, Money, Tag, type TagVariant } from "@/components/ui";
import { ROUTES, withTransfer } from "@/constants";
import { formatWhen } from "@/features/verdicts";
import { payeeService } from "@/services/payee.service";
import { useBills, usePayees, usePayeesStore, useTransfers } from "@/store";
import type { Transfer, TransferStatus } from "@/types/transfer";
import { cn, errorMessage } from "@/utils";
import { balances } from "./balances";
import { settleUp } from "./settle";

const STATUS: Record<TransferStatus, { label: string; tag: TagVariant }> = {
  pending: { label: "Not checked", tag: "outline" },
  warned: { label: "Warned", tag: "outline" },
  passed: { label: "Sent", tag: "passed" },
  overridden: { label: "Warned, sent", tag: "passed" },
  blocked: { label: "Blocked", tag: "blocked" },
  cancelled: { label: "Cancelled", tag: "outline" },
  expired: { label: "Expired", tag: "outline" },
};

/** Where a past attempt opens: the score for a block, the held warning, or the ledger. */
function attemptHref(t: Transfer) {
  if (t.status === "blocked") return withTransfer(ROUTES.PAY_BLOCKED_WHY, t.id);
  if (t.status === "warned") return withTransfer(ROUTES.PAY_WARN, t.id);
  return ROUTES.LEDGER;
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/** One payee, its past attempts, what you owe each other and the edit, request, settle, report and remove actions. Shared by the mobile and desktop screens. */
export function usePayee(id: string) {
  const router = useRouter();
  const { items: payees, status: payeesStatus } = usePayees();
  const transfers = useTransfers();
  const bills = useBills();
  const payee = payees.find((p) => p.id === id);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [pending, setPending] = useState<"report" | "remove" | "settle" | null>(null);

  // Not in the loaded list (or the list failed): fetch just this payee.
  const listSettled = payeesStatus === "ready" || payeesStatus === "error";
  useEffect(() => {
    if (payee || !listSettled || pending === "remove") return;
    payeeService
      .get(id)
      .then((p) => usePayeesStore.getState().upsert(p))
      .catch(() => setFailedId(id));
  }, [id, payee, listSettled, pending]);

  const stats = payee
    ? [
        { term: "First seen", value: formatWhen(payee.createdAt, ", ") },
        { term: "Transfers", value: `${payee.transferCount} completed` },
        { term: "Total sent", value: <Money sgd={payee.totalSentSgd} /> },
        { term: "Note", value: payee.note || "—" },
      ]
    : [];

  // Positive: they owe you. Negative: you owe them.
  const debt = balances(bills.items).find((d) => (d.from === id && d.to === "me") || (d.from === "me" && d.to === id));
  const owedSgd = !debt ? 0 : debt.from === id ? debt.amountSgd : -debt.amountSgd;
  // Open shares between you and this payee, either way.
  const openShares = bills.items.flatMap((bill) =>
    bill.shares
      .filter((s) => !s.settledAt && ((bill.paidBy === "me" && s.who === id) || (bill.paidBy === id && s.who === "me")))
      .map((share) => ({ bill, share, theyOwe: share.who === id })),
  );

  function settle() {
    setPending("settle");
    settleUp("me", id)
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setPending(null));
  }

  function toggleReport() {
    if (!payee) return;
    setPending("report");
    usePayeesStore
      .getState()
      .update(id, { reported: !payee.reported })
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setPending(null));
  }

  function remove() {
    if (!payee || !window.confirm(`Remove ${payee.name}? Past payments stay in your ledger.`)) return;
    setPending("remove");
    usePayeesStore
      .getState()
      .remove(id)
      .then(() => router.push(ROUTES.PAYEES))
      .catch((err) => {
        toast.error(errorMessage(err));
        setPending(null);
      });
  }

  async function save(body: { name: string; account: string; note: string }) {
    await usePayeesStore.getState().update(id, body);
    setEditing(false);
  }

  return {
    id,
    payee,
    notFound: failedId === id,
    transfers,
    attempts: transfers.items.filter((t) => t.payeeId === id),
    stats,
    editing,
    setEditing,
    requesting,
    setRequesting,
    bills,
    owedSgd,
    openShares,
    settle,
    pending,
    toggleReport,
    remove,
    save,
  };
}

export type PayeeModel = ReturnType<typeof usePayee>;

export function PastAttempts({ m, variant = "mobile" }: { m: PayeeModel; variant?: "mobile" | "desktop" }) {
  const { transfers, attempts } = m;
  return (
    <section className="flex flex-col">
      <h2 className={cn("m-0 mb-[4px] font-display font-bold", variant === "desktop" ? "text-[17px]" : "text-[16px]")}>Past attempts</h2>
      {transfers.status === "error" ? (
        <p className="m-0 py-[8px] text-[14px] font-medium text-muted">
          {transfers.error}{" "}
          <button type="button" onClick={() => void transfers.load(true)} className="cursor-pointer font-semibold text-teal">
            Retry
          </button>
        </p>
      ) : transfers.status !== "ready" ? (
        <p className="m-0 py-[8px] text-[14px] font-medium text-muted">Loading…</p>
      ) : attempts.length === 0 ? (
        <p className="m-0 py-[8px] text-[14px] font-medium text-muted">
          No payments to {m.payee?.name} yet. Start one from{" "}
          <Link href={ROUTES.PAY} className="font-semibold text-teal">
            Pay
          </Link>
          .
        </p>
      ) : (
        attempts.map((t, i) => (
          <Link
            key={t.id}
            href={attemptHref(t)}
            className={
              i < attempts.length - 1
                ? "grid min-h-[64px] grid-cols-[1fr_auto] items-center gap-[2px_12px] border-b border-line py-[8px] text-night no-underline"
                : "grid min-h-[64px] grid-cols-[1fr_auto] items-center gap-[2px_12px] py-[8px] text-night no-underline"
            }
          >
            <span className="text-[15px] font-semibold"><Money sgd={t.amountSgd} /></span>
            <Tag variant={STATUS[t.status].tag}>{STATUS[t.status].label}</Tag>
            <span className="text-[13px] font-medium text-muted">
              {formatWhen(t.createdAt)}
              {t.score !== null && `, score ${t.score}`}
            </span>
          </Link>
        ))
      )}
    </section>
  );
}

/** The running balance with this payee, a settle-up action and the open shares behind it. */
export function PayeeBalance({ m, variant = "mobile" }: { m: PayeeModel; variant?: "mobile" | "desktop" }) {
  const { payee, bills, owedSgd, openShares } = m;
  if (!payee) return null;
  if (bills.status !== "ready") {
    return (
      <p className="m-0 text-[14px] font-medium text-muted">
        {bills.status === "error" ? (
          <>
            {bills.error}{" "}
            <button type="button" onClick={() => void bills.load(true)} className="cursor-pointer font-semibold text-teal">
              Retry
            </button>
          </>
        ) : (
          "Loading…"
        )}
      </p>
    );
  }
  return (
    <section className="flex flex-col gap-[8px]">
      <div className="flex items-center justify-between gap-[12px]">
        <h2 className={cn("m-0 font-display font-bold", variant === "desktop" ? "text-[17px]" : "text-[16px]")}>
          {owedSgd > 0 ? (
            <>
              {payee.name} owes you <Money sgd={owedSgd} />
            </>
          ) : owedSgd < 0 ? (
            <>
              You owe {payee.name} <Money sgd={-owedSgd} />
            </>
          ) : (
            "You're square"
          )}
        </h2>
        {owedSgd !== 0 && (
          <Button variant="secondary" className="h-[40px] flex-none px-[14px] disabled:opacity-60" disabled={m.pending !== null} onClick={m.settle}>
            {m.pending === "settle" ? "Marking…" : "Mark as settled"}
          </Button>
        )}
      </div>
      {openShares.map(({ bill, share, theyOwe }) => (
        <div key={`${bill.id}-${share.who}`} className="grid grid-cols-[1fr_auto] items-center gap-[2px_12px] border-b border-line py-[6px] last:border-b-0">
          <span className="truncate text-[15px] font-semibold">{bill.title}</span>
          <span className="text-[15px] font-semibold"><Money sgd={share.amountSgd} /></span>
          <span className="col-span-full text-[13px] font-medium text-muted">
            {formatWhen(bill.createdAt)}, {theyOwe ? "they owe you" : "you owe them"}
          </span>
        </div>
      ))}
    </section>
  );
}
