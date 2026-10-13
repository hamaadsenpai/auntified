import { useSyncExternalStore } from "react";
import type { TagVariant } from "@/components/ui";
import type { Expense } from "@/types/expense";
import type { TransferStatus } from "@/types/transfer";

export const DAY_MS = 86_400_000;

const DAY = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const DAY_YEAR = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const WEEKDAY = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** "11 Oct" */
export const formatDay = (iso: string | number) => DAY.format(new Date(iso));
/** "11 Oct 2026" */
export const formatDayYear = (iso: string | number) => DAY_YEAR.format(new Date(iso));
/** "Sat 11 Oct 2026" */
export const formatWeekday = (iso: string | number) => WEEKDAY.format(new Date(iso)).replace(",", "");
/** "23:52" */
export const formatTime = (iso: string | number) => TIME.format(new Date(iso));

/** "27 Sep to 11 Oct 2026" (both years when they differ). */
export function formatRange(from: string, to: string) {
  const sameYear = new Date(from).getFullYear() === new Date(to).getFullYear();
  return `${sameYear ? formatDay(from) : formatDayYear(from)} to ${formatDayYear(to)}`;
}

const noop = () => () => {};
// Rounded to the minute so repeated snapshot reads agree.
const minute = () => Math.floor(Date.now() / 60_000) * 60_000;
const none = () => null;

/** The current time on the client; null during the server render, so prerendered HTML never bakes in a date. */
export function useNow(): number | null {
  return useSyncExternalStore(noop, minute, none);
}

/** Tag and label for a transfer's status in the history list. */
export const STATUS_TAG: Record<TransferStatus, { tag: TagVariant; label: string }> = {
  passed: { tag: "passed", label: "Passed" },
  overridden: { tag: "outline", label: "Overridden" },
  warned: { tag: "outline", label: "Warned" },
  blocked: { tag: "blocked", label: "Blocked" },
  cancelled: { tag: "outline", label: "Cancelled" },
  pending: { tag: "outline", label: "Pending" },
  expired: { tag: "outline", label: "Expired" },
};

/** Expenses spent in the window [now - toDays, now - fromDays). */
export function spentBetween(expenses: Expense[], now: number, fromDays: number, toDays: number) {
  return expenses.filter((e) => {
    const age = now - new Date(e.spentAt).getTime();
    return age >= fromDays * DAY_MS && age < toDays * DAY_MS;
  });
}

export const sumSgd = (items: { amountSgd: number }[]) => items.reduce((sum, i) => sum + i.amountSgd, 0);

/** Totals per category, biggest first. */
export function byCategory(expenses: Expense[]) {
  const totals = new Map<string, { category: string; totalSgd: number; count: number }>();
  for (const e of expenses) {
    const t = totals.get(e.category) ?? { category: e.category, totalSgd: 0, count: 0 };
    t.totalSgd += e.amountSgd;
    t.count += 1;
    totals.set(e.category, t);
  }
  return [...totals.values()].sort((a, b) => b.totalSgd - a.totalSgd);
}

export type ExpenseWeek = {
  /** Local Monday 00:00 of the week (ms). */
  start: number;
  /** spentAt of the week's latest expense, used to place the roast in history. */
  at: string;
  totalSgd: number;
  count: number;
};

function weekStart(iso: string) {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

/** Calendar weeks (Monday to Sunday, local time) that have expenses, newest first. */
export function expenseWeeks(expenses: Expense[]): ExpenseWeek[] {
  const weeks = new Map<number, ExpenseWeek>();
  for (const e of expenses) {
    const start = weekStart(e.spentAt);
    const w = weeks.get(start) ?? { start, at: e.spentAt, totalSgd: 0, count: 0 };
    w.totalSgd += e.amountSgd;
    w.count += 1;
    if (new Date(e.spentAt) > new Date(w.at)) w.at = e.spentAt;
    weeks.set(start, w);
  }
  return [...weeks.values()].sort((a, b) => b.start - a.start);
}
