"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { TagVariant } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useCredits, useExpenses, useTransfers, useTransfersStore } from "@/store";
import type { Credit } from "@/types/credit";
import type { Expense } from "@/types/expense";
import type { Transfer } from "@/types/transfer";
import { errorMessage } from "@/utils";
import { expenseWeeks, formatRange, STATUS_TAG, sumSgd } from "./history";

export const FILTERS = ["Payments", "Roasts", "Blocks", "Credits"] as const;

export type Filter = "All" | (typeof FILTERS)[number];

export type Entry = {
  key: string;
  /** Set on payment rows only: the transfer to delete. */
  transfer?: Transfer;
  /** Set on credit rows only. */
  credit?: Credit;
  at: string;
  title: string;
  amount: number;
  suffix?: string;
  score?: string;
  tag: TagVariant;
  label: string;
  href?: string;
};

/** Every transfer and credit plus one "Weekly roast" per week with expenses, newest first. */
function buildEntries(transfers: Transfer[], expenses: Expense[], credits: Credit[]): Entry[] {
  const payments: Entry[] = transfers.map((t) => ({
    key: `t-${t.id}`,
    transfer: t,
    at: t.createdAt,
    title: t.payeeName,
    amount: t.amountSgd,
    score: t.score === null ? undefined : String(Math.round(t.score)),
    ...STATUS_TAG[t.status],
    href: ROUTES.PAYEE(t.payeeId),
  }));
  const roasts: Entry[] = expenseWeeks(expenses).map((w) => ({
    key: `w-${w.start}`,
    at: w.at,
    title: "Weekly roast",
    amount: w.totalSgd,
    suffix: " leaked",
    tag: "roast",
    label: "Roast",
    href: ROUTES.ROAST,
  }));
  const deposits: Entry[] = credits.map((c) => ({
    key: `c-${c.id}`,
    credit: c,
    at: c.createdAt,
    title: c.kind === "salary" ? "Salary" : "Top-up",
    amount: c.amountSgd,
    suffix: " in",
    tag: "passed",
    label: "Credit",
  }));
  return [...payments, ...roasts, ...deposits].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

function matches(e: Entry, filter: Filter) {
  if (filter === "Payments") return !!e.transfer;
  if (filter === "Roasts") return !e.transfer && !e.credit;
  if (filter === "Blocks") return e.transfer?.status === "blocked";
  if (filter === "Credits") return !!e.credit;
  return true;
}

/** History list state shared by the mobile and desktop ledger. */
export function useLedger() {
  const transfers = useTransfers();
  const expenses = useExpenses();
  const credits = useCredits();
  const [filter, setFilter] = useState<Filter>("All");
  const [deleting, setDeleting] = useState<string | null>(null);

  const all = useMemo(() => buildEntries(transfers.items, expenses.items, credits.items), [transfers.items, expenses.items, credits.items]);
  const entries = useMemo(() => all.filter((e) => matches(e, filter)), [all, filter]);

  const summary = useMemo(() => {
    const blocked = transfers.items.filter((t) => t.status === "blocked");
    const checked = transfers.items.filter((t) => t.score !== null);
    const weeks = expenseWeeks(expenses.items);
    return {
      blockedCount: blocked.length,
      keptSgd: sumSgd(blocked),
      checkedCount: checked.length,
      passedCount: checked.filter((t) => t.status === "passed").length,
      overriddenCount: checked.filter((t) => t.status === "overridden").length,
      leakedSgd: sumSgd(weeks.map((w) => ({ amountSgd: w.totalSgd }))),
      roastCount: weeks.length,
      range: all.length ? formatRange(all[all.length - 1].at, all[0].at) : "No history yet",
    };
  }, [transfers.items, expenses.items, all]);

  const status: "loading" | "ready" | "error" =
    transfers.status === "error" || expenses.status === "error" || credits.status === "error"
      ? "error"
      : transfers.status === "ready" && expenses.status === "ready" && credits.status === "ready"
        ? "ready"
        : "loading";

  const retry = () => {
    if (transfers.status === "error") void transfers.load(true);
    if (expenses.status === "error") void expenses.load(true);
    if (credits.status === "error") void credits.load(true);
  };

  const remove = async (t: Transfer) => {
    if (!window.confirm(`Delete this ${t.payeeName} payment from your history?`)) return;
    setDeleting(t.id);
    try {
      await useTransfersStore.getState().remove(t.id);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  return {
    entries,
    hasAny: all.length > 0,
    summary,
    status,
    error: transfers.error ?? expenses.error ?? credits.error,
    retry,
    filter,
    setFilter,
    remove,
    deleting,
  };
}
