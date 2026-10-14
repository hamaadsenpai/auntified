import { useSyncExternalStore } from "react";
import type { Expense } from "@/types/expense";
import type { SavingsGoal } from "@/types/settings";

export const DAY_MS = 86_400_000;

const DAY_MONTH = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const DAY_MONTH_YEAR = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

/** "11 Oct" */
export const formatDay = (d: Date) => DAY_MONTH.format(d);
/** "23:52" */
export const formatTime = (d: Date) => TIME.format(d);

let cached: Date | null = null;

function getNow() {
  const minute = Math.floor(Date.now() / 60_000) * 60_000;
  if (cached?.getTime() !== minute) cached = new Date(minute);
  return cached;
}

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

/** The time now, to the minute, in the viewer's timezone. null on the server, so nothing date-based is prerendered. */
export function useNow(): Date | null {
  return useSyncExternalStore(subscribe, getNow, () => null);
}

export function startOfDay(d: Date): Date {
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  return day;
}

/** "This week" is the last 7 days: from midnight 6 days ago to the end of today. */
export function weekWindow(now: Date): { start: Date; end: Date } {
  const start = startOfDay(now);
  start.setDate(start.getDate() - 6);
  const end = startOfDay(now);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

/** "7 to 13 Oct 2026", "29 Sep to 5 Oct 2026", "29 Dec 2025 to 4 Jan 2026". */
export function weekLabel(now: Date): string {
  const { start } = weekWindow(now);
  if (start.getFullYear() !== now.getFullYear()) return `${DAY_MONTH_YEAR.format(start)} to ${DAY_MONTH_YEAR.format(now)}`;
  const from = start.getMonth() === now.getMonth() ? String(start.getDate()) : DAY_MONTH.format(start);
  return `${from} to ${DAY_MONTH_YEAR.format(now)}`;
}

export function inRange(e: Expense, start: Date, end: Date): boolean {
  const t = Date.parse(e.spentAt);
  return t >= start.getTime() && t < end.getTime();
}

export const sumSgd = (expenses: Expense[]) => expenses.reduce((sum, e) => sum + e.amountSgd, 0);

export type CategoryTotal = { category: string; totalSgd: number; count: number };

/** Spending per category, biggest first. */
export function byCategory(expenses: Expense[]): CategoryTotal[] {
  const totals = new Map<string, CategoryTotal>();
  for (const e of expenses) {
    const t = totals.get(e.category) ?? { category: e.category, totalSgd: 0, count: 0 };
    t.totalSgd += e.amountSgd;
    t.count += 1;
    totals.set(e.category, t);
  }
  return [...totals.values()].sort((a, b) => b.totalSgd - a.totalSgd);
}

/** "Normal" is the average week over up to this many weeks before this one. */
export const NORMAL_WEEKS = 12;

/**
 * Average weekly spend, per category and in total, over the NORMAL_WEEKS before `start` (this week's start).
 * Divides by the weeks of history actually there (whole weeks back to the oldest expense, 1 to NORMAL_WEEKS),
 * so a short history isn't diluted by weeks the user wasn't logging yet. Home and Patterns both use this.
 */
export function weeklyNormal(expenses: Expense[], start: Date) {
  const week = 7 * DAY_MS;
  const past = expenses.filter((e) => inRange(e, new Date(start.getTime() - NORMAL_WEEKS * week), start));
  const oldest = expenses.reduce((min, e) => Math.min(min, Date.parse(e.spentAt)), Infinity);
  const weeks = Math.min(NORMAL_WEEKS, Math.max(1, Math.ceil((start.getTime() - oldest) / week)));
  return {
    perCategory: new Map(byCategory(past).map((c) => [c.category, c.totalSgd / weeks])),
    totalSgd: sumSgd(past) / weeks,
    hasHistory: past.length > 0,
    weeks,
  };
}

/** Progress towards a savings goal. `daysLeft` counts calendar days to the "YYYY-MM-DD" deadline. */
export function goalProgress(goal: SavingsGoal, now: Date) {
  const [y, m, d] = goal.deadline.split("-").map(Number);
  const deadline = new Date(y, m - 1, d);
  return {
    deadline,
    percent: goal.targetSgd > 0 ? Math.min(100, Math.round((goal.savedSgd / goal.targetSgd) * 100)) : 0,
    shortSgd: Math.max(0, goal.targetSgd - goal.savedSgd),
    daysLeft: Math.round((deadline.getTime() - startOfDay(now).getTime()) / DAY_MS),
  };
}

/** "YYYY-MM-DD" in local time, for <input type="date">. */
export function toDateInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The local calendar day from a date input, at the time of day of `time`. */
export function fromDateInput(value: string, time: Date): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, time.getHours(), time.getMinutes(), time.getSeconds());
}
