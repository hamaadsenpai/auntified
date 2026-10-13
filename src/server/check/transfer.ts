import "server-only";
import { io } from "next/cache";
import { COLLECTIONS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { db } from "@/lib/firebase/admin";
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
};

const SENT: TransferStatus[] = ["passed", "overridden"];

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Gathers the facts from the payee, the user's sent transfers and their balance. 404 if the payee is gone. */
export async function buildTransferFacts(
  uid: string,
  { payeeId, amountSgd, reference }: CreateTransfer,
): Promise<TransferFacts> {
  await io();
  const user = db.collection(COLLECTIONS.USERS).doc(uid);
  const [payee, sent, userSnap] = await Promise.all([
    getPayee(uid, payeeId),
    user.collection(COLLECTIONS.TRANSFERS).where("status", "in", SENT).select("amountSgd").get(),
    user.get(),
  ]);
  if (!payee) throw ApiError.notFound("Payee not found.");
  const balance = userSnap.get("balanceSgd");
  return {
    amountSgd,
    payeeName: payee.name,
    reference,
    payeeAgeMinutes: Math.max(0, Math.floor((Date.now() - Date.parse(payee.createdAt)) / 60_000)),
    priorTransfersToPayee: payee.transferCount,
    scamReports: payee.reported ? 1 : 0,
    medianTransferSgd: median(sent.docs.map((d) => d.get("amountSgd")).filter((v): v is number => typeof v === "number")),
    availableSgd: typeof balance === "number" ? balance : 0,
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
  if (t.amountSgd > t.availableSgd) {
    score += 4;
    flags.push("More than your available balance");
  }
  return { score: Math.min(score, 46), flags };
}
