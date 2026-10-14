import "server-only";
import { io } from "next/cache";
import { FieldValue, Timestamp, type BulkWriter, type DocumentData, type DocumentReference } from "firebase-admin/firestore";
import { COLLECTIONS, DEFAULT_SETTINGS, SALARY_SGD } from "@/constants";
import { DEMO_FIRE } from "@/constants/demo";
import { db } from "@/lib/firebase/admin";
import { hourSgt, scoreRules, usualHours } from "@/server/check/transfer";
import type { DemoState } from "@/types/demo";
import type { TransferStatus } from "@/types/transfer";
import { MAIN_ACCOUNT_ID } from "@/utils/accounts";
import { seedFirstSalary } from "./credits.repository";
import { createTransfer } from "./transfers.repository";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
// Seeded days are Singapore days, the app's home market, whatever timezone the server runs in.
const SGT = 8 * HOUR;

const userRef = (uid: string) => db.collection(COLLECTIONS.USERS).doc(uid);
const DATA = [COLLECTIONS.PAYEES, COLLECTIONS.EXPENSES, COLLECTIONS.TRANSFERS, COLLECTIONS.CREDITS, COLLECTIONS.BILLS];

const offsetOf = (data: DocumentData | undefined) => (typeof data?.clockOffsetMs === "number" ? data.clockOffsetMs : 0);
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
const round = (n: number, places = 2) => Math.round(n * 10 ** places) / 10 ** places;
const ymd = (ms: number) => new Date(ms + SGT).toISOString().slice(0, 10);

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Runs writes through one BulkWriter (no 500-write cap) and fails if any of them fails. */
async function bulk(write: (w: BulkWriter) => Promise<unknown>[]) {
  const writer = db.bulkWriter();
  // Every write's promise is awaited here, so a failed one can't become an unhandled rejection.
  await Promise.all([...write(writer), writer.close()]);
}

export async function getDemoState(uid: string): Promise<DemoState> {
  await io();
  return { clockOffsetMs: offsetOf((await userRef(uid).get()).data()) };
}

/** Deletes payees, expenses, transfers, credits and bills, and puts every setting back to what a new user sees. Keeps the profile (currency, onboarding). */
export async function resetDemo(uid: string): Promise<DemoState> {
  await io();
  const user = userRef(uid);
  await Promise.all(DATA.map((c) => db.recursiveDelete(user.collection(c))));
  const keys = [...Object.keys(DEFAULT_SETTINGS), "clockOffsetMs"];
  const cleared = Object.fromEntries(keys.map((k) => [k, FieldValue.delete()]));
  // Like a new sign-up: back to defaults, then the first salary so the balance isn't 0.
  await db.runTransaction(async (tx) => {
    tx.set(user, { ...cleared, balanceSgd: SALARY_SGD }, { merge: true });
    seedFirstSalary(tx, uid);
  });
  return { clockOffsetMs: 0 };
}

const SPENDS = [
  { category: "Food delivery", names: ["GrabFood", "foodpanda", "Deliveroo"], min: 12, max: 38 },
  { category: "Rides", names: ["Grab ride", "Gojek", "ComfortDelGro"], min: 8, max: 26 },
  { category: "Bubble tea", names: ["LiHO", "KOI Thé", "Gong Cha"], min: 4.5, max: 7.8 },
  { category: "Shopping", names: ["Shopee", "Lazada", "Uniqlo"], min: 15, max: 120 },
  { category: "Groceries", names: ["FairPrice", "Sheng Siong", "Cold Storage"], min: 22, max: 85 },
  { category: "Other", names: ["Kopitiam", "Guardian", "Popular"], min: 3, max: 25 },
] as const;

const PAYEES = {
  rent: { name: "Mr Lim", account: "DBS 012-34567-8", note: "Landlord" },
  mum: { name: "Mum", account: "PayNow 9123 8821", note: "Mum" },
  gym: { name: "ActiveSG", account: "PayNow 9001 2234", note: "Gym" },
  friend: { name: "Jia Hui", account: "PayNow 9876 5432", note: "Friend" },
  bro: { name: "Wei Ming", account: "PayNow 8234 1190", note: "Brother" },
  crypto: { name: "Profit Desk Asia", account: "PayNow 8812 0457", note: "" },
  parcel: { name: "SG Parcel Clearance", account: "PayNow 8301 6672", note: "" },
};
type PayeeKey = keyof typeof PAYEES;

type Planned = {
  payee: PayeeKey;
  at: number;
  amountSgd: number;
  reference: string;
  status: TransferStatus;
  modelScore: number;
  reasons: string[];
};

const BALANCE_SGD = 6240.35;

/** Replaces the user's data with about 90 days of history: payees, everyday spending, sent transfers and two stopped scams. */
export async function seedDemo(uid: string): Promise<DemoState> {
  await resetDemo(uid);
  const now = Date.now();
  const today = Math.floor((now + SGT) / DAY) * DAY - SGT;
  /** A time `daysAgo` Singapore days back, at `hour` o'clock plus a few random minutes. */
  const at = (daysAgo: number, hour: number) => today - daysAgo * DAY + hour * HOUR + Math.floor(rand(0, 50)) * MINUTE;

  const expenses: DocumentData[] = [];
  for (let d = 0; d < 90; d++) {
    const items: { name: string; category: string; amountSgd: number; at: number }[] = Array.from(
      { length: 1 + Math.floor(rand(0, 3)) },
      () => {
        const s = pick(SPENDS);
        return { name: pick(s.names), category: s.category, amountSgd: round(rand(s.min, s.max), 1), at: at(d, Math.floor(rand(8, 22))) };
      },
    );
    if (d % 30 === 12) {
      items.push({ name: "Netflix", category: "Subscriptions", amountSgd: 19.98, at: at(d, 9) });
      items.push({ name: "Spotify", category: "Subscriptions", amountSgd: 11.98, at: at(d, 9) });
    }
    for (const e of items) {
      if (e.at > now) continue;
      const time = Timestamp.fromMillis(e.at);
      expenses.push({ name: e.name, category: e.category, amountSgd: e.amountSgd, spentAt: time, createdAt: time });
    }
  }

  const sent = (payee: PayeeKey, days: number[], amount: () => number, reference: string, hour: number): Planned[] =>
    days.map((d) => ({ payee, at: at(d, hour), amountSgd: amount(), reference, status: "passed", modelScore: Math.floor(rand(2, 9)), reasons: [] }));
  const planned: Planned[] = [
    ...sent("rent", [88, 58, 28], () => 1200, "Rent", 10),
    ...sent("mum", [85, 55, 25], () => 500, "Monthly allowance", 19),
    ...sent("gym", [80, 50, 20], () => 45, "Membership", 12),
    ...sent("friend", [83, 72, 61, 47, 36, 22, 12, 4], () => round(rand(18, 60), 1), "Dinner split", 21),
    ...sent("bro", [66, 9], () => 100, "Concert tickets", 20),
    {
      payee: "crypto",
      at: at(40, 22),
      amountSgd: 2500,
      reference: "Unlock my profits",
      status: "blocked",
      modelScore: 50,
      reasons: ["Promised crypto returns", "Told to pay to unlock a withdrawal", "Payee added minutes ago"],
    },
    {
      payee: "parcel",
      at: at(18, 14),
      amountSgd: 380,
      reference: "Customs clearance fee",
      status: "cancelled",
      modelScore: 24,
      reasons: ["Fee asked for by text message", "Couriers don't collect fees by PayNow"],
    },
  ];
  planned.sort((a, b) => a.at - b.at);

  // Regular payees were added before the 90 days; the scam payees a few minutes before their transfer.
  const firstAt = (key: PayeeKey) => Math.min(...planned.filter((p) => p.payee === key).map((p) => p.at));
  const payees = Object.fromEntries(
    (Object.keys(PAYEES) as PayeeKey[]).map((key) => {
      const createdAt = key === "crypto" || key === "parcel" ? firstAt(key) - 4 * MINUTE : at(95, 10);
      return [key, { ref: userRef(uid).collection(COLLECTIONS.PAYEES).doc(), createdAt, reported: key === "crypto", count: 0, total: 0 }];
    }),
  ) as Record<PayeeKey, { ref: DocumentReference; createdAt: number; reported: boolean; count: number; total: number }>;

  // Flags come from the real rules, with the facts as they stood at each transfer.
  const amountsSent: number[] = [];
  const hoursSoFar: number[] = [];
  const transfers = planned.map((t) => {
    const p = payees[t.payee];
    const rules = scoreRules({
      amountSgd: t.amountSgd,
      payeeName: PAYEES[t.payee].name,
      reference: t.reference,
      payeeAgeMinutes: Math.floor((t.at - p.createdAt) / MINUTE),
      priorTransfersToPayee: p.count,
      scamReports: 0,
      medianTransferSgd: median(amountsSent),
      availableSgd: BALANCE_SGD,
      hourSgt: hourSgt(t.at),
      usualHours: usualHours(hoursSoFar),
    });
    hoursSoFar.push(hourSgt(t.at));
    const isNew = p.count === 0;
    if (t.status === "passed") {
      p.count += 1;
      p.total = round(p.total + t.amountSgd);
      amountsSent.push(t.amountSgd);
    }
    const reasons = t.reasons.length ? t.reasons : [isNew ? "New payee, but an everyday reason" : "Known payee, usual amount"];
    return {
      payeeId: p.ref.id,
      payeeName: PAYEES[t.payee].name,
      amountSgd: t.amountSgd,
      reference: t.reference,
      status: t.status,
      flags: rules.flags,
      rulesScore: rules.score,
      modelScore: t.modelScore,
      score: Math.min(100, rules.score + t.modelScore),
      reasons,
      appeal: null,
      createdAt: Timestamp.fromMillis(t.at),
      updatedAt: Timestamp.fromMillis(t.at + 2 * MINUTE),
    };
  });

  const user = userRef(uid);
  await bulk((w) => [
    ...(Object.keys(PAYEES) as PayeeKey[]).map((key) => {
      const p = payees[key];
      return w.create(p.ref, {
        ...PAYEES[key],
        reported: p.reported,
        createdAt: Timestamp.fromMillis(p.createdAt),
        transferCount: p.count,
        totalSentSgd: p.total,
      });
    }),
    ...expenses.map((e) => w.create(user.collection(COLLECTIONS.EXPENSES).doc(), e)),
    ...transfers.map((t) => w.create(user.collection(COLLECTIONS.TRANSFERS).doc(), t)),
    w.set(
      user,
      { balanceSgd: BALANCE_SGD, savingsGoal: { targetSgd: 5000, savedSgd: 1640, deadline: ymd(now + 75 * DAY) } },
      { merge: true },
    ),
  ]);
  return { clockOffsetMs: 0 };
}

/** Adds a payee DEMO_FIRE.PAYEE_AGE_MIN minutes old and holds a large first transfer to it, through the real rules. */
export async function fireScam(uid: string): Promise<DemoState> {
  await io();
  const user = userRef(uid);
  const payee = user.collection(COLLECTIONS.PAYEES).doc();
  await payee.set({
    name: "Elite Crypto Desk",
    account: "PayNow 8765 4321",
    note: "",
    reported: false,
    createdAt: Timestamp.fromMillis(Date.now() - DEMO_FIRE.PAYEE_AGE_MIN * MINUTE),
    transferCount: 0,
    totalSentSgd: 0,
  });
  const transfer = await createTransfer(uid, {
    payeeId: payee.id,
    amountSgd: DEMO_FIRE.AMOUNT_SGD,
    reference: "Release my investment payout",
    fromAccountId: MAIN_ACCOUNT_ID,
  });
  return { clockOffsetMs: offsetOf((await user.get()).data()), transferId: transfer.id };
}

/**
 * Moves the clock forward by moving every timestamp of the user's data back by `hours`, so each
 * rule and stat that compares against Date.now() (payee age, pending expiry, roast week, ask) sees
 * the time pass. The savings goal deadline moves back by the whole days crossed.
 */
export async function jumpClock(uid: string, hours: number): Promise<DemoState> {
  await io();
  const ms = hours * HOUR;
  const back = (t: Timestamp) => Timestamp.fromMillis(t.toMillis() - ms);
  const user = userRef(uid);
  const [snap, ...collections] = await Promise.all([user.get(), ...DATA.map((c) => user.collection(c).get())]);

  const before = offsetOf(snap.data());
  const offset = before + ms;
  const days = Math.floor(offset / DAY) - Math.floor(before / DAY);
  const goal = snap.get("savingsGoal") as { deadline?: unknown } | null | undefined;
  const deadline = typeof goal?.deadline === "string" && /^\d{4}-\d{2}-\d{2}$/.test(goal.deadline) ? goal.deadline : null;

  await bulk((w) => [
    ...collections.flatMap((col) =>
      col.docs.flatMap((doc) => {
        const data = doc.data();
        const changes: DocumentData = {};
        for (const [key, value] of Object.entries(data)) if (value instanceof Timestamp) changes[key] = back(value);
        if (data.appeal?.at instanceof Timestamp) changes["appeal.at"] = back(data.appeal.at);
        // Bills keep settledAt inside the shares array, which a dotted path cannot reach.
        if (Array.isArray(data.shares) && data.shares.some((s) => s?.settledAt instanceof Timestamp))
          changes.shares = data.shares.map((s: DocumentData) => (s?.settledAt instanceof Timestamp ? { ...s, settledAt: back(s.settledAt) } : s));
        return Object.keys(changes).length ? [w.update(doc.ref, changes)] : [];
      }),
    ),
    w.set(
      user,
      {
        clockOffsetMs: offset,
        ...(deadline && days > 0 && { savingsGoal: { ...goal, deadline: ymd(Date.parse(`${deadline}T00:00:00+08:00`) - days * DAY) } }),
      },
      { merge: true },
    ),
  ]);
  return { clockOffsetMs: offset };
}
