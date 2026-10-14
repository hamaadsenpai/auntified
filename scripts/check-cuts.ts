import assert from "node:assert/strict";
// @ts-expect-error -- plain `node scripts/check-cuts.ts` needs the .ts extension, which tsc rejects without allowImportingTsExtensions.
import { findLeaks, findRecurring, forecastSgd, suggestCuts, WEEKS_PER_MONTH } from "../src/features/roast/cuts.ts";

const now = new Date("2026-10-14T12:00:00Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();
let id = 0;
const sub = (name: string, amountSgd: number, days: number, category = "Subscriptions") => ({
  id: String(id++), name, category, amountSgd, spentAt: daysAgo(days), createdAt: daysAgo(days),
});

const leaks = findLeaks(
  [
    sub("Netflix", 18, 40),
    sub(" netflix ", 20, 10),
    sub("Spotify", 11, 5),
    sub("Gym", 50, 90),
    sub("Gym", 50, 60),
    sub("Disney+", 9, 30),
    sub("Disney+", 9, 2, "Food"),
    sub("iCloud", 3, 30),
    sub("ICLOUD", 3, 1),
  ],
  now,
);
assert.deepEqual(
  leaks.map((l) => [l.name, l.monthlySgd, l.charges]),
  [["netflix", 20, 2], ["ICLOUD", 3, 2]],
);
assert.equal(leaks[0].lastAt, daysAgo(10));

// Statement imports: a recurring charge counts from its first sighting; a recurring bill is never a leak.
const imported = [
  { ...sub("Gym Pass", 40, 3, "Other"), recurring: true },
  { ...sub("Rent", 1200, 5, "Bills"), recurring: true },
];
assert.deepEqual(findLeaks(imported, now).map((l) => l.name), ["Gym Pass"]);
assert.deepEqual(findRecurring(imported, now).map((l) => l.name), ["Rent", "Gym Pass"]);

const cuts = suggestCuts(
  [
    { category: "Subscriptions", totalSgd: 100, count: 3 },
    { category: "Food", totalSgd: 60, count: 5 },
    { category: "Transport", totalSgd: 20, count: 2 },
  ],
  leaks,
);
assert.deepEqual(cuts.map((c) => c.key), ["category:Food", "leak:netflix", "leak:icloud"]);
assert.equal(cuts[0].keepSgd, 30);
assert.equal(cuts[0].monthlySgd, 30 * WEEKS_PER_MONTH);
assert.equal(forecastSgd(cuts), 30 * WEEKS_PER_MONTH + 23);
assert.deepEqual(suggestCuts([{ category: "Subscriptions", totalSgd: 10, count: 1 }], []), []);

console.log("cuts ok");
