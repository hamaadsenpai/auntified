"use client";

import Link from "next/link";
import { BottomNav, Screen } from "@/components/layout";
import { Chip, Money, Tag } from "@/components/ui";
import { ROUTES } from "@/constants";
import { cn } from "@/utils";
import { FILTERS, type Filter, useLedger } from "./entries";
import { formatDay, formatTime } from "./history";

export const FILTER_ACTIVE = "border-none bg-teal px-[16px] text-white";

export function LedgerScreen() {
  const ledger = useLedger();
  const { entries } = ledger;
  return (
    <Screen className="lg:hidden">
      <header className="flex flex-none flex-col gap-[2px] px-[20px] pt-[16px] pb-[8px]">
        <h1 className="m-0 font-display text-[22px] leading-[1.1] font-bold">History</h1>
        <span className="text-[13px] font-medium text-muted">Every roast, verdict and credit, newest first</span>
      </header>
      <div role="group" aria-label="Filter" className="flex flex-none gap-[8px] overflow-x-auto px-[20px] pt-[6px] pb-[10px] *:shrink-0">
        {(["All", ...FILTERS] as Filter[]).map((f) => (
          <Chip key={f} aria-pressed={ledger.filter === f} onClick={() => ledger.setFilter(f)} className={cn(ledger.filter === f && FILTER_ACTIVE)}>
            {f}
          </Chip>
        ))}
      </div>
      {ledger.deleteError && (
        <p role="alert" className="mx-[20px] mb-[8px] rounded-[14px] border-[1.5px] border-brick px-[14px] py-[10px] text-[14px] font-semibold text-brick">
          {ledger.deleteError}
        </p>
      )}
      <ol className="m-0 flex min-h-0 flex-1 list-none flex-col overflow-y-auto border-t border-line px-[20px] *:shrink-0">
        {ledger.status !== "ready" ? (
          <li className="py-[16px]">
            <LedgerStatus status={ledger.status} error={ledger.error} retry={ledger.retry} />
          </li>
        ) : entries.length === 0 ? (
          <li className="py-[16px]">
            <LedgerEmpty hasAny={ledger.hasAny} />
          </li>
        ) : (
          entries.map((e, i) => {
            const t = e.transfer;
            return (
              <li
                key={e.key}
                className={cn(
                  "grid min-h-[62px] grid-cols-[56px_1fr_28px_auto] items-center gap-[10px] py-[6px]",
                  i < entries.length - 1 && "border-b border-line",
                )}
              >
                <span className="text-[12px] leading-[1.3] font-medium text-muted">
                  {formatDay(e.at)}
                  <br />
                  {formatTime(e.at)}
                </span>
                <span className="flex flex-col gap-[1px]">
                  {e.href ? (
                    <Link href={e.href} className="text-[14px] font-semibold text-teal underline-offset-4 hover:underline">
                      {e.title}
                    </Link>
                  ) : (
                    <span className="text-[14px] font-semibold">{e.title}</span>
                  )}
                  <span className="text-[13px] font-medium text-muted"><Money sgd={e.amount} />{e.suffix}</span>
                  {t && <DeleteButton title={e.title} pending={ledger.deleting === t.id} onClick={() => ledger.remove(t)} className="self-start" />}
                </span>
                {e.score === undefined ? (
                  <span></span>
                ) : (
                  <span className="text-right font-display text-[15px] font-bold">{e.score}</span>
                )}
                <Tag variant={e.tag}>{e.label}</Tag>
              </li>
            );
          })
        )}
      </ol>
      <BottomNav active="ledger" />
    </Screen>
  );
}

type StatusProps = { status: "loading" | "error"; error: string | null; retry: () => void };

/** Loading text, or the load error with a retry. */
export function LedgerStatus({ status, error, retry }: StatusProps) {
  if (status === "loading") return <p className="m-0 text-[14px] font-medium text-muted">Loading…</p>;
  return (
    <div role="alert" className="flex flex-wrap items-center gap-[12px] text-[14px] font-semibold text-brick">
      <span>{error ?? "Couldn't load your history."}</span>
      <button type="button" onClick={retry} className="min-h-[44px] cursor-pointer text-teal underline underline-offset-4">
        Try again
      </button>
    </div>
  );
}

/** No entries at all, or none for the chosen filter. */
export function LedgerEmpty({ hasAny }: { hasAny: boolean }) {
  return (
    <p className="m-0 text-[14px] font-medium text-muted">
      {hasAny ? (
        "Nothing here for this filter yet."
      ) : (
        <>
          No history yet. <Link href={ROUTES.PAY} className="font-semibold text-teal">Send a payment</Link> for Auntie to check, or log
          spending on your <Link href={ROUTES.ROAST} className="font-semibold text-teal">roast</Link>, and it shows up here.
        </>
      )}
    </p>
  );
}

type DeleteProps = { title: string; pending: boolean; onClick: () => void; className?: string };

/** Small text button that deletes one payment from history (the handler confirms first). */
export function DeleteButton({ title, pending, onClick, className }: DeleteProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={`Delete ${title} payment`}
      className={cn("min-h-[24px] cursor-pointer text-[12px] font-semibold text-brick disabled:cursor-default disabled:opacity-60", className)}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
