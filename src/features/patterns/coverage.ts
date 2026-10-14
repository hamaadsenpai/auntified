import type { Expense } from "@/types/expense";
import type { Payee } from "@/types/payee";
import type { Transfer } from "@/types/transfer";

// No runtime imports: scripts/check-coverage.ts runs this file in plain Node.
const WINDOW_MS = 90 * 86_400_000;
const MONTHS = 3;
const RIDES_MONTHLY_SGD = 100;
const FAMILY_MONTHLY_SGD = 100;
const FAMILY = /\b(mum|mom|mother|dad|father|parents?|wife|husband|son|daughter|kids?|child(ren)?|grandma|grandpa|ah ma|ah gong|brother|sister|family)\b/i;

/** Cover the user's spending says they may be missing. Amounts are a month's worth, in SGD. */
export type CoverageGap =
  | { kind: "hospital" }
  | { kind: "accident"; monthlySgd: number }
  | { kind: "life"; payee: string; monthlySgd: number };

/**
 * Coverage gaps from the last 90 days of spending and transfers:
 * - hospital: no Insurance expense ever logged.
 * - accident: S$100+ a month on Rides, with no premium that looks like personal accident cover.
 * - life: S$100+ a month sent to family (payee name or note), with no premium that looks like life cover.
 */
export function coverageGaps(expenses: Expense[], transfers: Transfer[], payees: Payee[], now: Date): CoverageGap[] {
  const since = now.getTime() - WINDOW_MS;
  const premiums = expenses.filter((e) => e.category === "Insurance").map((e) => e.name.toLowerCase());
  const covered = (re: RegExp) => premiums.some((name) => re.test(name));
  const gaps: CoverageGap[] = [];

  if (premiums.length === 0) gaps.push({ kind: "hospital" });

  const ridesSgd = expenses.filter((e) => e.category === "Rides" && Date.parse(e.spentAt) >= since).reduce((sum, e) => sum + e.amountSgd, 0);
  if (ridesSgd / MONTHS >= RIDES_MONTHLY_SGD && !covered(/accident|\bpa\b/)) gaps.push({ kind: "accident", monthlySgd: ridesSgd / MONTHS });

  const family = new Set(payees.filter((p) => FAMILY.test(`${p.name} ${p.note}`)).map((p) => p.id));
  const toFamily = new Map<string, number>();
  for (const t of transfers) {
    if ((t.status !== "passed" && t.status !== "overridden") || !family.has(t.payeeId) || Date.parse(t.createdAt) < since) continue;
    toFamily.set(t.payeeName, (toFamily.get(t.payeeName) ?? 0) + t.amountSgd);
  }
  const [top] = [...toFamily].sort((a, b) => b[1] - a[1]);
  const familySgd = [...toFamily.values()].reduce((sum, v) => sum + v, 0);
  if (top && familySgd / MONTHS >= FAMILY_MONTHLY_SGD && !covered(/life|term/)) gaps.push({ kind: "life", payee: top[0], monthlySgd: familySgd / MONTHS });

  return gaps;
}
