import type { Expense } from "@/types/expense";
import type { CategoryTotal } from "./week";

/** Average weeks in a month, to turn a weekly cut into a monthly one. */
export const WEEKS_PER_MONTH = 52 / 12;

// Not DAY_MS from ./week: this file stays free of runtime imports so scripts/check-cuts.ts runs it in plain Node.
const LEAK_WINDOW_MS = 45 * 86_400_000;

/** A charge that keeps coming back. A subscription among them may be one the user stopped using (a leak). */
export type Leak = { name: string; category: string; monthlySgd: number; charges: number; lastAt: string };

/** Recurring, but a bill to pay rather than a leak to cut. */
const ESSENTIAL = ["Bills", "Insurance"];

/** Subscriptions, plus anything else non-essential a statement import marked as recurring. */
export const isLeakCandidate = (e: Expense) => e.category === "Subscriptions" || (e.recurring === true && !ESSENTIAL.includes(e.category));

/**
 * Recurring charges among the expenses `keep` lets through: names (case-insensitive, trimmed; display the latest
 * charge's name) charged at least twice or marked recurring by a statement import, whose latest charge is within
 * the last 45 days of `now`. monthlySgd is the latest charge. Biggest monthlySgd first.
 */
export function findRecurring(expenses: Expense[], now: Date, keep: (e: Expense) => boolean = (e) => e.category === "Subscriptions" || e.recurring === true): Leak[] {
  const groups = new Map<string, { latest: Expense; charges: number; recurring: boolean }>();
  for (const e of expenses) {
    if (!keep(e)) continue;
    const key = e.name.trim().toLowerCase();
    const g = groups.get(key);
    if (!g) groups.set(key, { latest: e, charges: 1, recurring: e.recurring === true });
    else {
      g.charges += 1;
      g.recurring ||= e.recurring === true;
      if (Date.parse(e.spentAt) > Date.parse(g.latest.spentAt)) g.latest = e;
    }
  }
  return [...groups.values()]
    .filter((g) => (g.charges >= 2 || g.recurring) && now.getTime() - Date.parse(g.latest.spentAt) <= LEAK_WINDOW_MS)
    .map((g) => ({ name: g.latest.name.trim(), category: g.latest.category, monthlySgd: g.latest.amountSgd, charges: g.charges, lastAt: g.latest.spentAt }))
    .sort((a, b) => b.monthlySgd - a.monthlySgd);
}

/** Leaks: recurring subscriptions and other non-essential recurring charges (see isLeakCandidate). */
export const findLeaks = (expenses: Expense[], now: Date): Leak[] => findRecurring(expenses, now, isLeakCandidate);

/** One suggested cut. `keepSgd` is what one tap puts towards the savings goal; `monthlySgd` feeds the forecast. */
export type Cut =
  | { kind: "category"; key: string; category: string; weekSgd: number; count: number; keepSgd: number; monthlySgd: number }
  | { kind: "leak"; key: string; leak: Leak; keepSgd: number; monthlySgd: number };

/**
 * The cuts to suggest: halve this week's biggest category other than "Subscriptions" (keepSgd = half the week's spend,
 * monthlySgd = keepSgd * WEEKS_PER_MONTH), then cancel each leak (keepSgd = monthlySgd = its monthly charge).
 * key: "category:<name>" / "leak:<lowercased name>".
 */
export function suggestCuts(categories: CategoryTotal[], leaks: Leak[]): Cut[] {
  const cuts: Cut[] = [];
  const top = categories.find((c) => c.category !== "Subscriptions");
  if (top) {
    const keepSgd = top.totalSgd / 2;
    cuts.push({ kind: "category", key: `category:${top.category}`, category: top.category, weekSgd: top.totalSgd, count: top.count, keepSgd, monthlySgd: keepSgd * WEEKS_PER_MONTH });
  }
  for (const leak of leaks) {
    cuts.push({ kind: "leak", key: `leak:${leak.name.toLowerCase()}`, leak, keepSgd: leak.monthlySgd, monthlySgd: leak.monthlySgd });
  }
  return cuts;
}

/** Forecast: what the user keeps this month if they make every cut. */
export const forecastSgd = (cuts: Cut[]) => cuts.reduce((sum, c) => sum + c.monthlySgd, 0);
