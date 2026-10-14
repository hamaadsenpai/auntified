import "server-only";
import { FieldValue, type DocumentData, type Transaction } from "firebase-admin/firestore";
import { COLLECTIONS, DEFAULT_SETTINGS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { db } from "@/lib/firebase/admin";
import type { Account } from "@/types/settings";
import { accountsOf, MAIN_ACCOUNT_ID, sendableSgd } from "@/utils/accounts";

/** Every account on a `users/{uid}` doc, the main one first. */
export function accountsFrom(data: DocumentData | undefined): Account[] {
  return accountsOf({
    accountName: typeof data?.accountName === "string" ? data.accountName : DEFAULT_SETTINGS.accountName,
    balanceSgd: typeof data?.balanceSgd === "number" ? data.balanceSgd : 0,
    accounts: Array.isArray(data?.accounts) ? data.accounts : [],
  });
}

/** What `account` can send given the Money Lock stored on the same `users/{uid}` doc. */
export const sendableFrom = (data: DocumentData | undefined, account: Account) =>
  sendableSgd({ lockedSgd: typeof data?.lockedSgd === "number" ? data.lockedSgd : 0 }, account);

/**
 * Reads account `accountId` in `tx` (a read, so call it before the transaction's writes); 404 if it doesn't exist.
 * `sendableSgd` is its balance less the Money Lock. `move` adds `deltaSgd` to its balance. Extra accounts sit in an array, so moving one rewrites the
 * array from this read, and the transaction retries if anything changed it meanwhile.
 */
export async function readAccount(tx: Transaction, uid: string, accountId: string) {
  const ref = db.collection(COLLECTIONS.USERS).doc(uid);
  const data = (await tx.get(ref)).data();
  const accounts = accountsFrom(data);
  const account = accounts.find((a) => a.id === accountId);
  if (!account) throw ApiError.notFound("That account no longer exists.");
  const move = (deltaSgd: number) =>
    tx.set(
      ref,
      accountId === MAIN_ACCOUNT_ID
        ? { balanceSgd: FieldValue.increment(deltaSgd) }
        : {
            accounts: accounts
              .slice(1)
              .map((a) => (a.id === accountId ? { ...a, balanceSgd: a.balanceSgd + deltaSgd } : a)),
          },
      { merge: true },
    );
  return { ...account, sendableSgd: sendableFrom(data, account), move };
}
