import assert from "node:assert/strict";
// @ts-expect-error -- plain `node scripts/check-coverage.ts` needs the .ts extension, which tsc rejects without allowImportingTsExtensions.
import { coverageGaps } from "../src/features/patterns/coverage.ts";
import type { Transfer } from "../src/types/transfer";

const now = new Date("2026-10-14T12:00:00Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();
const expense = (name: string, category: string, amountSgd: number, days: number) => ({ id: name + days, name, category, amountSgd, spentAt: daysAgo(days), createdAt: daysAgo(days) });
const mum = { id: "p1", name: "Mdm Tan", account: "", note: "Mum", reported: false, createdAt: daysAgo(200), transferCount: 3, totalSentSgd: 1500 };
// Only the fields coverageGaps reads.
const sent = (days: number) => ({ payeeId: "p1", payeeName: "Mdm Tan", amountSgd: 500, status: "passed", createdAt: daysAgo(days) }) as unknown as Transfer;

// Rides S$450 over 90 days = S$150 a month; S$1,500 to Mum = S$500 a month; no premiums at all.
const rides = [10, 20, 30].map((d) => expense("Grab", "Rides", 150, d));
assert.deepEqual(
  coverageGaps(rides, [sent(10), sent(40), sent(70)], [mum], now).map((g: { kind: string }) => g.kind),
  ["hospital", "accident", "life"],
);

// A life premium and a PA premium close those gaps; old rides (over 90 days) don't count.
const covered = [expense("AIA Term Life", "Insurance", 40, 5), expense("PA Plan", "Insurance", 10, 5), expense("Grab", "Rides", 900, 120)];
assert.deepEqual(coverageGaps(covered, [sent(10)], [mum], now), []);

console.log("coverage ok");
