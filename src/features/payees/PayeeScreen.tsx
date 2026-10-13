"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackHeader, Screen } from "@/components/layout";
import { Avatar, Button, Card, Money, Tag, type TagVariant } from "@/components/ui";
import { ROUTES, withTransfer } from "@/constants";
import { formatWhen } from "@/features/verdicts";
import { payeeService } from "@/services/payee.service";
import { usePayees, usePayeesStore, useTransfers } from "@/store";
import type { ApiFailure } from "@/types/api";
import type { Transfer, TransferStatus } from "@/types/transfer";
import { PayeeForm } from "./PayeeForm";

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

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

const errorMessage = (err: unknown) => (err as ApiFailure["error"])?.message ?? "Something went wrong. Try again.";

export function PayeeScreen({ id }: { id: string }) {
  const router = useRouter();
  const { items: payees, status: payeesStatus } = usePayees();
  const transfers = useTransfers();
  const payee = payees.find((p) => p.id === id);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState<"report" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Not in the loaded list (or the list failed): fetch just this payee.
  const listSettled = payeesStatus === "ready" || payeesStatus === "error";
  useEffect(() => {
    if (payee || !listSettled || pending === "remove") return;
    payeeService
      .get(id)
      .then((p) => usePayeesStore.getState().upsert(p))
      .catch(() => setFailedId(id));
  }, [id, payee, listSettled, pending]);

  if (!payee) {
    return (
      <Screen>
        <BackHeader backHref={ROUTES.PAY} title="Payee" />
        <main className="flex flex-1 flex-col items-center justify-center gap-[12px] px-[20px] text-center">
          {failedId === id ? (
            <>
              <p className="m-0 font-display text-[18px] font-bold">We could not find this payee.</p>
              <Link href={ROUTES.PAY} className="text-[15px] font-semibold text-teal">
                Back to Pay
              </Link>
            </>
          ) : (
            <p className="m-0 text-[14px] font-medium text-muted">Loading…</p>
          )}
        </main>
      </Screen>
    );
  }

  const attempts = transfers.items.filter((t) => t.payeeId === id);
  const stats = [
    { term: "First seen", value: formatWhen(payee.createdAt, ", ") },
    { term: "Transfers", value: `${payee.transferCount} completed` },
    { term: "Total sent", value: <Money sgd={payee.totalSentSgd} /> },
    { term: "Category", value: payee.note || "—" },
  ];

  function toggleReport() {
    if (!payee) return;
    setPending("report");
    setError(null);
    usePayeesStore
      .getState()
      .update(id, { reported: !payee.reported })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setPending(null));
  }

  function remove() {
    if (!payee || !window.confirm(`Remove ${payee.name}? Past payments stay in your ledger.`)) return;
    setPending("remove");
    setError(null);
    usePayeesStore
      .getState()
      .remove(id)
      .then(() => router.push(ROUTES.PAY))
      .catch((err) => {
        setError(errorMessage(err));
        setPending(null);
      });
  }

  return (
    <Screen>
      <BackHeader backHref={ROUTES.PAY} title="Payee">
        <button
          type="button"
          aria-expanded={editing}
          onClick={() => setEditing((e) => !e)}
          className="ml-auto flex min-h-[44px] cursor-pointer items-center text-[15px] font-semibold text-teal"
        >
          {editing ? "Close" : "Edit payee"}
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
        {editing && (
          <PayeeForm
            initial={{ name: payee.name, account: payee.account, note: payee.note }}
            submitLabel="Save payee"
            onSubmit={async (body) => {
              await usePayeesStore.getState().update(id, body);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        )}
        <dl className="m-0 grid grid-cols-[1fr_1fr] gap-[10px]">
          {stats.map((stat) => (
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
        <section className="flex flex-col">
          <h2 className="m-0 mb-[4px] font-display text-[16px] font-bold">Past attempts</h2>
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
              No payments to {payee.name} yet. Start one from{" "}
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
        {error && (
          <p role="alert" className="m-0 rounded-[14px] border-[1.5px] border-brick px-[14px] py-[10px] text-[14px] font-semibold text-brick">
            {error}
          </p>
        )}
      </main>
      <div className="flex flex-none flex-col gap-[10px] px-[20px] pt-[12px] pb-[24px]">
        <Button className="disabled:opacity-60" disabled={pending !== null} onClick={toggleReport}>
          {pending === "report" ? "Saving…" : payee.reported ? "Undo report" : "Report this payee"}
        </Button>
        <Button variant="secondary" className="disabled:opacity-60" disabled={pending !== null} onClick={remove}>
          {pending === "remove" ? "Removing…" : "Remove payee"}
        </Button>
      </div>
    </Screen>
  );
}
