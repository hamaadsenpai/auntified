import "server-only";
import { io } from "next/cache";
import { Timestamp, type DocumentData, type Transaction } from "firebase-admin/firestore";
import { COLLECTIONS, SALARY_SGD } from "@/constants";
import { db } from "@/lib/firebase/admin";
import type { CreateCredit, Credit } from "@/types/credit";
import { MAIN_ACCOUNT_ID } from "@/utils/accounts";
import { readAccount } from "./accounts.repository";

const userRef = (uid: string) => db.collection(COLLECTIONS.USERS).doc(uid);
const creditsOf = (uid: string) => userRef(uid).collection(COLLECTIONS.CREDITS);

const iso = (v: unknown) => (v instanceof Timestamp ? v.toDate() : new Date(0)).toISOString();

function toCredit(id: string, data: DocumentData): Credit {
  return {
    id,
    kind: data.kind === "salary" ? "salary" : "topup",
    amountSgd: typeof data.amountSgd === "number" ? data.amountSgd : 0,
    accountId: typeof data.accountId === "string" ? data.accountId : MAIN_ACCOUNT_ID,
    createdAt: iso(data.createdAt),
  };
}

/** Writes the credit doc in the caller's transaction. The caller moves the account's balance. */
function writeCredit(tx: Transaction, uid: string, { kind, amountSgd, accountId }: CreateCredit): Credit {
  const ref = creditsOf(uid).doc();
  const data = { kind, amountSgd, accountId, createdAt: Timestamp.now() };
  tx.create(ref, data);
  return toCredit(ref.id, data);
}

/** A new user's first pay day, written in the sign-up transaction; the caller sets `balanceSgd: SALARY_SGD`. */
export const seedFirstSalary = (tx: Transaction, uid: string) => writeCredit(tx, uid, { kind: "salary", amountSgd: SALARY_SGD, accountId: MAIN_ACCOUNT_ID });

/** Newest first. `io()` before each read: see `getUserProfile` in users.repository. */
export async function listCredits(uid: string): Promise<Credit[]> {
  await io();
  const snap = await creditsOf(uid).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => toCredit(d.id, d.data()));
}

/** Records the credit and adds it to its account's balance together, so neither lands without the other. 404 if the account is gone. */
export async function addCredit(uid: string, body: CreateCredit): Promise<Credit> {
  return db.runTransaction(async (tx) => {
    const account = await readAccount(tx, uid, body.accountId);
    const credit = writeCredit(tx, uid, body);
    account.move(body.amountSgd);
    return credit;
  });
}
