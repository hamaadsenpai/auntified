import "server-only";
import { io } from "next/cache";
import { Timestamp, type DocumentData } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { db } from "@/lib/firebase/admin";
import type { Bill, BillShare, CreateBill, Party, UpdateBill } from "@/types/bill";

const userRef = (uid: string) => db.collection(COLLECTIONS.USERS).doc(uid);
const billsOf = (uid: string) => userRef(uid).collection(COLLECTIONS.BILLS);

/** True when `id` is one path segment; anything with a slash would address another document. */
const isSegment = (id: string) => !!id && id.length <= 128 && !id.includes("/") && id !== "." && id !== "..";

function billRef(uid: string, id: string) {
  if (!isSegment(id)) throw ApiError.notFound("Bill not found.");
  return billsOf(uid).doc(id);
}

const iso = (v: unknown) => (v instanceof Timestamp ? v.toDate() : new Date(0)).toISOString();
const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" ? v : 0);

function toShare(data: DocumentData): BillShare {
  return {
    who: str(data?.who),
    name: str(data?.name),
    amountSgd: num(data?.amountSgd),
    settledAt: data?.settledAt instanceof Timestamp ? iso(data.settledAt) : null,
  };
}

function toBill(id: string, data: DocumentData): Bill {
  return {
    id,
    kind: data.kind === "request" ? "request" : "split",
    title: str(data.title),
    totalSgd: num(data.totalSgd),
    paidBy: str(data.paidBy),
    paidByName: str(data.paidByName),
    shares: Array.isArray(data.shares) ? data.shares.map(toShare) : [],
    createdAt: iso(data.createdAt),
  };
}

/** Newest first. `io()` before each read: see `getUserProfile` in users.repository. */
export async function listBills(uid: string): Promise<Bill[]> {
  await io();
  const snap = await billsOf(uid).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => toBill(d.id, d.data()));
}

/** Every non-"me" party must be one of the user's payees; their names are stored as snapshots. */
export async function createBill(uid: string, { kind, title, totalSgd, paidBy, shares }: CreateBill): Promise<Bill> {
  await io();
  const ids = [...new Set([paidBy, ...shares.map((s) => s.who)])].filter((p) => p !== "me");
  if (!ids.every(isSegment)) throw ApiError.badRequest("Unknown payee.");
  const payees = userRef(uid).collection(COLLECTIONS.PAYEES);
  const snaps = ids.length ? await db.getAll(...ids.map((id) => payees.doc(id))) : [];
  const names = new Map<Party, string>([["me", "You"]]);
  for (const snap of snaps) {
    if (!snap.exists) throw ApiError.badRequest("Unknown payee.");
    names.set(snap.id, str(snap.get("name")));
  }

  const ref = billsOf(uid).doc();
  const data = {
    kind,
    title,
    totalSgd,
    paidBy,
    paidByName: names.get(paidBy)!,
    shares: shares.map((s) => ({ who: s.who, name: names.get(s.who)!, amountSgd: s.amountSgd, settledAt: null })),
    createdAt: Timestamp.now(),
  };
  await ref.set(data);
  return toBill(ref.id, data);
}

/** Marks the shares of `settle` paid back (or open again). Records only: no money moves. */
export async function updateBill(uid: string, id: string, { settle, settled }: UpdateBill): Promise<Bill> {
  await io();
  const ref = billRef(uid, id);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw ApiError.notFound("Bill not found.");
    const data = snap.data()!;
    const stored: DocumentData[] = Array.isArray(data.shares) ? data.shares : [];
    if (!settle.every((p) => stored.some((s) => s?.who === p))) throw ApiError.badRequest("Not on this bill.");
    const settledAt = settled === false ? null : Timestamp.now();
    const shares = stored.map((s) => (settle.includes(s?.who) ? { ...s, settledAt } : s));
    tx.update(ref, { shares });
    return toBill(id, { ...data, shares });
  });
}

/** Deletes the bill record only. */
export async function deleteBill(uid: string, id: string): Promise<{ id: string }> {
  await io();
  const ref = billRef(uid, id);
  const snap = await ref.get();
  if (!snap.exists) throw ApiError.notFound("Bill not found.");
  await ref.delete();
  return { id };
}
