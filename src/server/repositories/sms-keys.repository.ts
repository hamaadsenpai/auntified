import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { io } from "next/cache";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/constants";
import { db } from "@/lib/firebase/admin";
import type { CreatedSmsKey, SmsKeyStatus } from "@/types/sms";

const users = db.collection(COLLECTIONS.USERS);
const smsKeys = db.collection(COLLECTIONS.SMS_KEYS);

/** Only the hash is stored, so a database leak doesn't hand out working keys. */
const hashKey = (key: string) => createHash("sha256").update(key).digest("hex");

const iso = (v: unknown) => (v instanceof Timestamp ? v.toDate().toISOString() : null);

/**
 * Makes a new key for the user and returns it. This is the only time it is readable.
 * Lookup: smsKeys/{hash} → { uid }. The user doc keeps the hash so the old key can be deleted.
 */
export async function createSmsKey(uid: string): Promise<CreatedSmsKey> {
  const key = `aunt_${randomBytes(32).toString("base64url")}`;
  const hash = hashKey(key);
  const now = Timestamp.now();
  await db.runTransaction(async (tx) => {
    const old = (await tx.get(users.doc(uid))).get("smsKeyHash");
    if (typeof old === "string") tx.delete(smsKeys.doc(old));
    tx.set(smsKeys.doc(hash), { uid, createdAt: now });
    tx.set(users.doc(uid), { smsKeyHash: hash, smsKeyCreatedAt: now, smsKeyLastUsedAt: null }, { merge: true });
  });
  return { key, active: true, createdAt: now.toDate().toISOString(), lastUsedAt: null };
}

export async function getSmsKeyStatus(uid: string): Promise<SmsKeyStatus> {
  await io();
  const data = (await users.doc(uid).get()).data() ?? {};
  return {
    active: typeof data.smsKeyHash === "string",
    createdAt: iso(data.smsKeyCreatedAt),
    lastUsedAt: iso(data.smsKeyLastUsedAt),
  };
}

/** The old key stops working at once. */
export async function revokeSmsKey(uid: string): Promise<SmsKeyStatus> {
  await db.runTransaction(async (tx) => {
    const old = (await tx.get(users.doc(uid))).get("smsKeyHash");
    if (typeof old === "string") tx.delete(smsKeys.doc(old));
    tx.update(users.doc(uid), {
      smsKeyHash: FieldValue.delete(),
      smsKeyCreatedAt: FieldValue.delete(),
      smsKeyLastUsedAt: FieldValue.delete(),
    });
  });
  return { active: false, createdAt: null, lastUsedAt: null };
}

/** The uid the key belongs to, or null. Stamps "last used" so Settings can show the Shortcut works. */
export async function findUidBySmsKey(key: string): Promise<string | null> {
  const snap = await smsKeys.doc(hashKey(key)).get();
  const uid = snap.get("uid");
  if (typeof uid !== "string") return null;
  await users.doc(uid).update({ smsKeyLastUsedAt: FieldValue.serverTimestamp() });
  return uid;
}