import "server-only";
import { io } from "next/cache";
import { Timestamp, type DocumentData } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { db } from "@/lib/firebase/admin";
import type { CreatePayee, Payee, UpdatePayee } from "@/types/payee";

const payeesOf = (uid: string) => db.collection(COLLECTIONS.USERS).doc(uid).collection(COLLECTIONS.PAYEES);

/** A path segment from the URL; anything with a slash would address another document. */
function payeeRef(uid: string, id: string) {
  if (!id || id.length > 128 || id.includes("/") || id === "." || id === "..") throw ApiError.notFound("Payee not found.");
  return payeesOf(uid).doc(id);
}

const iso = (v: unknown) => (v instanceof Timestamp ? v.toDate() : new Date(0)).toISOString();

function toPayee(id: string, data: DocumentData): Payee {
  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    account: typeof data.account === "string" ? data.account : "",
    note: typeof data.note === "string" ? data.note : "",
    reported: data.reported === true,
    createdAt: iso(data.createdAt),
    transferCount: typeof data.transferCount === "number" ? data.transferCount : 0,
    totalSentSgd: typeof data.totalSentSgd === "number" ? data.totalSentSgd : 0,
  };
}

/** Newest first. `io()` before each read: see `getUserProfile` in users.repository. */
export async function listPayees(uid: string): Promise<Payee[]> {
  await io();
  const snap = await payeesOf(uid).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => toPayee(d.id, d.data()));
}

export async function getPayee(uid: string, id: string): Promise<Payee | null> {
  await io();
  const snap = await payeeRef(uid, id).get();
  return snap.exists ? toPayee(snap.id, snap.data()!) : null;
}

export async function createPayee(uid: string, { name, account, note }: CreatePayee): Promise<Payee> {
  const ref = payeesOf(uid).doc();
  const data = {
    name,
    account,
    note: note ?? "",
    reported: false,
    createdAt: Timestamp.now(),
    transferCount: 0,
    totalSentSgd: 0,
  };
  await ref.set(data);
  return toPayee(ref.id, data);
}

/** Edits name/account/note/reported. transferCount and totalSentSgd are only moved by sends. */
export async function updatePayee(uid: string, id: string, body: UpdatePayee): Promise<Payee> {
  await io();
  const ref = payeeRef(uid, id);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw ApiError.notFound("Payee not found.");
    tx.update(ref, body);
    return toPayee(id, { ...snap.data(), ...body });
  });
}

/** Deletes the payee only: its transfers keep their `payeeName` snapshot. */
export async function deletePayee(uid: string, id: string): Promise<{ id: string }> {
  await io();
  const ref = payeeRef(uid, id);
  const snap = await ref.get();
  if (!snap.exists) throw ApiError.notFound("Payee not found.");
  await ref.delete();
  return { id };
}
