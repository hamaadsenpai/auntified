import "server-only";
import { io } from "next/cache";
import { FieldValue, Timestamp, type DocumentSnapshot } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/constants";
import { db } from "@/lib/firebase/admin";
import type { CreateExpense, Expense, UpdateExpense } from "@/types/expense";

const expenses = (uid: string) => db.collection(COLLECTIONS.USERS).doc(uid).collection(COLLECTIONS.EXPENSES);

const iso = (v: unknown) => (v instanceof Timestamp ? v.toDate() : new Date(0)).toISOString();

function toExpense(snap: DocumentSnapshot): Expense {
  const data = snap.data()!;
  return {
    id: snap.id,
    name: data.name,
    category: data.category,
    amountSgd: data.amountSgd,
    spentAt: iso(data.spentAt),
    createdAt: iso(data.createdAt),
    ...(data.recurring === true && { recurring: true }),
  };
}

/** Newest spentAt first. */
export async function listExpenses(uid: string): Promise<Expense[]> {
  await io();
  const snap = await expenses(uid).orderBy("spentAt", "desc").get();
  return snap.docs.map(toExpense);
}

export async function createExpense(uid: string, { name, category, amountSgd, spentAt }: CreateExpense): Promise<Expense> {
  const ref = expenses(uid).doc();
  await ref.set({
    name,
    category,
    amountSgd,
    spentAt: spentAt ? Timestamp.fromDate(new Date(spentAt)) : Timestamp.now(),
    createdAt: FieldValue.serverTimestamp(),
  });
  // Read back so createdAt is the server's time, not ours.
  return toExpense(await ref.get());
}

/** null when the expense doesn't exist. */
export async function updateExpense(uid: string, id: string, body: UpdateExpense): Promise<Expense | null> {
  const ref = expenses(uid).doc(id);
  const { spentAt, ...rest } = body;
  const found = await db.runTransaction(async (tx) => {
    if (!(await tx.get(ref)).exists) return false;
    tx.update(ref, { ...rest, ...(spentAt && { spentAt: Timestamp.fromDate(new Date(spentAt)) }) });
    return true;
  });
  return found ? toExpense(await ref.get()) : null;
}

/** false when the expense doesn't exist. */
export async function deleteExpense(uid: string, id: string): Promise<boolean> {
  const ref = expenses(uid).doc(id);
  return db.runTransaction(async (tx) => {
    if (!(await tx.get(ref)).exists) return false;
    tx.delete(ref);
    return true;
  });
}

/**
 * Adds expenses read from a bank statement in one batch. Skips any that match an expense already
 * logged (same name, amount and day), so importing the same statement twice adds nothing.
 */
export async function addStatementExpenses(uid: string, items: (Required<CreateExpense> & { recurring: boolean })[]) {
  const key = (name: string, amountSgd: number, spentAt: string) => `${name.trim().toLowerCase()}|${amountSgd.toFixed(2)}|${spentAt.slice(0, 10)}`;
  const seen = new Set((await listExpenses(uid)).map((e) => key(e.name, e.amountSgd, e.spentAt)));
  const fresh = items.filter((e) => {
    const k = key(e.name, e.amountSgd, new Date(e.spentAt).toISOString());
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  // Firestore batches cap at 500 writes; the parser caps a statement well under that.
  const batch = db.batch();
  for (const e of fresh) {
    batch.set(expenses(uid).doc(), {
      name: e.name,
      category: e.category,
      amountSgd: e.amountSgd,
      spentAt: Timestamp.fromDate(new Date(e.spentAt)),
      createdAt: FieldValue.serverTimestamp(),
      ...(e.recurring && { recurring: true }),
    });
  }
  await batch.commit();
  return { added: fresh.length, skipped: items.length - fresh.length };
}
