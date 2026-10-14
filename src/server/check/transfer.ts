import "server-only";
import { io } from "next/cache";
import { COLLECTIONS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { db } from "@/lib/firebase/admin";
import { accountsFrom } from "@/server/repositories/accounts.repository";
import { getPayee } from "@/server/repositories/payees.repository";
import type { CreateTransfer, TransferStatus } from "@/types/transfer";

/** What the bank knows about a transfer before Auntie asks anything. */
export type TransferFacts = {
  amountSgd: number;
  payeeName: string;
  reference: string;
  payeeAgeMinutes: number;
  priorTransfersToPayee: number;
  scamReports: number;
  /** Median of the user's sent transfers; null before their first one. */
  medianTransferSgd: number | null;
  availableSgd: number;
  /** Hour of day it's being paid, Singapore time: 22.5 is 10:30pm. */
  hourSgt: number;
  /** 10th to 90th percentile of the hours of the user's transfers, in whole hours; null under 3 transfers. */
  usualHours: { from: number; to: number } | null;
};

const SENT: TransferStatus[] = ["passed", "overridden"];
/** Fewer than this and an hour range says nothing (same as Patterns). */
const MIN_TRANSFERS = 3;
const HOUR_MS = 3_600_000;
// shortcut: hours are Singapore time (the home market) while Patterns uses the browser's zone; store the user's zone if users go abroad.
const SGT_MS = 8 * HOUR_MS;

/** Hour of day in Singapore at `ms`, with minutes as a fraction. */
export const hourSgt = (ms: number) => ((ms + SGT_MS) % (24 * HOUR_MS)) / HOUR_MS;

/** 9.5 → "9:30am", 22 → "10pm". */
function hourLabel(hour: number): string {
  const minutes = Math.round(hour * 60) % (24 * 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""}${h < 12 ? "am" : "pm"}`;
}

/** Linear-interpolated percentile (0 to 1) of an ascending list. */
function percentile(sorted: number[], p: number): number {
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

/**
 * The user's usual paying hours from the hours of their transfers, worked out like Patterns does,
 * widened to whole hours so a 9:40pm habit isn't "outside 9am to 9pm".
 */
export function usualHours(hours: number[]): TransferFacts["usualHours"] {
  if (hours.length < MIN_TRANSFERS) return null;
  const sorted = [...hours].sort((a, b) => a - b);
  return { from: Math.floor(percentile(sorted, 0.1)), to: Math.ceil(percentile(sorted, 0.9)) };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Gathers the facts from the payee, the user's sent transfers and the paying account's balance. 404 if the payee or account is gone. */
export async function buildTransferFacts(
  uid: string,
  { payeeId, amountSgd, reference, fromAccountId }: CreateTransfer,
): Promise<TransferFacts> {
  await io();
  const user = db.collection(COLLECTIONS.USERS).doc(uid);
  const [payee, transfers, userSnap] = await Promise.all([
    getPayee(uid, payeeId),
    user.collection(COLLECTIONS.TRANSFERS).select("amountSgd", "status", "createdAt").get(),
    user.get(),
  ]);
  if (!payee) throw ApiError.notFound("Payee not found.");
  const from = accountsFrom(userSnap.data()).find((a) => a.id === fromAccountId);
  if (!from) throw ApiError.notFound("That account no longer exists.");
  const sent = transfers.docs.filter((d) => SENT.includes(d.get("status")));
  // Every transfer's hour counts, as in Patterns, except pending ones: the one being checked is pending.
  const hours = transfers.docs.filter((d) => d.get("status") !== "pending").map((d) => d.get("createdAt")?.toMillis?.()).filter((v): v is number => typeof v === "number");
  return {
    amountSgd,
    payeeName: payee.name,
    reference,
    payeeAgeMinutes: Math.max(0, Math.floor((Date.now() - Date.parse(payee.createdAt)) / 60_000)),
    priorTransfersToPayee: payee.transferCount,
    scamReports: payee.reported ? 1 : 0,
    medianTransferSgd: median(sent.map((d) => d.get("amountSgd")).filter((v): v is number => typeof v === "number")),
    availableSgd: from.balanceSgd,
    hourSgt: hourSgt(Date.now()),
    usualHours: usualHours(hours.map(hourSgt)),
  };
}

/** Deterministic red flags, scored before the model sees anything. Caps at 46 so the model decides the rest. */
export function scoreRules(t: TransferFacts): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;
  if (t.payeeAgeMinutes < 60) {
    score += 16;
    flags.push(`Payee added ${t.payeeAgeMinutes} min ago`);
  }
  if (t.priorTransfersToPayee === 0) {
    score += 10;
    flags.push("First transfer to this payee");
  }
  // No sent transfers yet means nothing to compare against.
  const multiple = t.medianTransferSgd ? t.amountSgd / t.medianTransferSgd : 0;
  if (multiple >= 10) {
    score += 12;
    flags.push(`${Math.round(multiple)}x your median transfer`);
  }
  if (t.scamReports > 0) {
    score += 8;
    flags.push(`${t.scamReports} scam report${t.scamReports === 1 ? "" : "s"} on this payee`);
  }
  // Late night (10pm to 6am) or outside the user's own usual hours.
  const late = t.hourSgt >= 22 || t.hourSgt < 6;
  const usual = t.usualHours;
  const unusual = usual !== null && (t.hourSgt < usual.from || t.hourSgt > usual.to);
  if (late || unusual) {
    score += 6;
    const when = `Paying at ${hourLabel(t.hourSgt)}`;
    flags.push(
      unusual
        ? `${when}, outside your usual ${hourLabel(usual.from)} to ${hourLabel(usual.to)}`
        : `${when}, late at night`,
    );
  }
  if (t.amountSgd > t.availableSgd) {
    score += 4;
    flags.push("More than your available balance");
  }
  return { score: Math.min(score, 46), flags };
}
