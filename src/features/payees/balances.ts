import type { Bill, Party } from "@/types/bill";

/** `from` owes `to` this much, after netting every open share between the two. */
export type Debt = { from: Party; fromName: string; to: Party; toName: string; amountSgd: number };

const cents = (sgd: number) => Math.round(sgd * 100);

/** Who owes whom: open shares netted per pair of people, largest first. Settled shares are ignored. */
export function balances(bills: Bill[]): Debt[] {
  const names = new Map<Party, string>();
  const net = new Map<string, { a: Party; b: Party; cents: number }>(); // cents > 0: a owes b
  for (const bill of bills) {
    names.set(bill.paidBy, bill.paidByName);
    for (const s of bill.shares) {
      names.set(s.who, s.name);
      if (s.settledAt || s.who === bill.paidBy) continue;
      const [a, b] = s.who < bill.paidBy ? [s.who, bill.paidBy] : [bill.paidBy, s.who];
      const pair = net.get(`${a}|${b}`) ?? { a, b, cents: 0 };
      pair.cents += s.who === a ? cents(s.amountSgd) : -cents(s.amountSgd);
      net.set(`${a}|${b}`, pair);
    }
  }
  return [...net.values()]
    .filter((p) => p.cents !== 0)
    .map(({ a, b, cents: c }) => {
      const [from, to] = c > 0 ? [a, b] : [b, a];
      return { from, fromName: names.get(from) ?? "", to, toName: names.get(to) ?? "", amountSgd: Math.abs(c) / 100 };
    })
    .sort((x, y) => y.amountSgd - x.amountSgd);
}

/** The PATCH bodies that settle up two people: every open share between them, either way, per bill. */
export function settleUpCalls(bills: Bill[], x: Party, y: Party): { id: string; settle: Party[] }[] {
  return bills.flatMap((bill) => {
    const other = bill.paidBy === x ? y : bill.paidBy === y ? x : null;
    const open = bill.shares.some((s) => s.who === other && !s.settledAt);
    return other && open ? [{ id: bill.id, settle: [other] }] : [];
  });
}

/** Splits a total into `n` parts to the cent; the first parts take the leftover cents. */
export function splitEqually(totalSgd: number, n: number): number[] {
  const total = cents(totalSgd);
  return Array.from({ length: n }, (_, i) => (Math.floor(total / n) + (i < total % n ? 1 : 0)) / 100);
}
