import "server-only";
import { io } from "next/cache";
import { FieldValue, Timestamp, type DocumentSnapshot } from "firebase-admin/firestore";
import { COLLECTIONS, LIMITS } from "@/constants";
import { db } from "@/lib/firebase/admin";
import type { SmsScan } from "@/types/sms";

const users = db.collection(COLLECTIONS.USERS);
const scans = (uid: string) => users.doc(uid).collection(COLLECTIONS.SMS_SCANS);

const HISTORY_SIZE = 50;

const iso = (v: unknown) => (v instanceof Timestamp ? v.toDate() : new Date(0)).toISOString();

function toScan(snap: DocumentSnapshot): SmsScan {
  const data = snap.data()!;
  return {
    id: snap.id,
    sender: data.sender ?? null,
    preview: data.preview,
    verdict: data.verdict,
    score: data.score,
    tactics: data.tactics,
    reasons: data.reasons,
    summary: data.summary,
    receivedAt: iso(data.receivedAt),
  };
}

/** The scan saved under this id, or null. Ids come from the text, so this finds a re-forwarded SMS. */
export async function getSmsScan(uid: string, id: string): Promise<SmsScan | null> {
  const snap = await scans(uid).doc(id).get();
  return snap.exists ? toScan(snap) : null;
}

export async function saveSmsScan(uid: string, id: string, scan: Omit<SmsScan, "id" | "receivedAt">): Promise<SmsScan> {
  const ref = scans(uid).doc(id);
  await ref.set({ ...scan, receivedAt: FieldValue.serverTimestamp() });
  return toScan(await ref.get());
}

/** Newest first, the last 50. */
export async function listSmsScans(uid: string): Promise<SmsScan[]> {
  await io();
  const snap = await scans(uid).orderBy("receivedAt", "desc").limit(HISTORY_SIZE).get();
  return snap.docs.map(toScan);
}

/** false when the scan doesn't exist. */
export async function deleteSmsScan(uid: string, id: string): Promise<boolean> {
  const ref = scans(uid).doc(id);
  return db.runTransaction(async (tx) => {
    if (!(await tx.get(ref)).exists) return false;
    tx.delete(ref);
    return true;
  });
}

/** Counts one scan against today's (UTC) allowance. false once the day's limit is used up. */
export async function claimDailySmsScan(uid: string): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const ref = users.doc(uid);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const count = snap.get("smsScanDay") === today ? (snap.get("smsScanCount") ?? 0) : 0;
    if (count >= LIMITS.SMS_SCANS_PER_DAY) return false;
    tx.set(ref, { smsScanDay: today, smsScanCount: count + 1 }, { merge: true });
    return true;
  });
}
