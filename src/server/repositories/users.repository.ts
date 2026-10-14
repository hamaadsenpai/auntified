import "server-only";
import { randomUUID } from "node:crypto";
import { io } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import type { DecodedIdToken } from "firebase-admin/auth";
import { COLLECTIONS, DEFAULT_SETTINGS, LIMITS, SALARY_SGD } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { db } from "@/lib/firebase/admin";
import type { AccountSettings, UpdateSettings } from "@/types/settings";
import type { Preferences, UpdatePreferences, UserProfile } from "@/types/user";
import { accountsFrom } from "./accounts.repository";
import { seedFirstSalary } from "./credits.repository";

const users = db.collection(COLLECTIONS.USERS);

/** Creates `users/{uid}` on first sign-in (paid their first salary, so the balance isn't 0) and stamps `lastLoginAt` on every one after. */
export async function upsertUserOnSignIn(token: DecodedIdToken) {
  const ref = users.doc(token.uid);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) {
      tx.update(ref, { lastLoginAt: FieldValue.serverTimestamp() });
      return;
    }
    tx.set(ref, {
      email: token.email ?? null,
      name: (token.name as string | undefined) ?? null,
      photoURL: (token.picture as string | undefined) ?? null,
      provider: token.firebase.sign_in_provider,
      createdAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(),
      balanceSgd: SALARY_SGD,
    });
    seedFirstSalary(tx, token.uid);
  });
}

/**
 * The profile as a DTO, or null before the first sign-in created it.
 * The Firestore SDK calls `crypto.randomBytes` synchronously, which cacheComponents rejects
 * during a prerender (the App Shell prefetch resolves the cookie, so the read gets that far).
 * `io()` suspends there and resolves immediately at request time.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  await io();
  const snap = await users.doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return {
    currency: typeof data.currency === "string" ? data.currency : null,
    onboarded: data.onboardedAt != null,
  };
}

/** Saves the currency; `completeOnboarding` stamps `onboardedAt` once and never moves it. */
export async function updateUserPreferences(
  uid: string,
  { currency, completeOnboarding }: UpdatePreferences,
): Promise<Preferences> {
  const ref = users.doc(uid);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const stamp = completeOnboarding && snap.get("onboardedAt") == null;
    tx.set(ref, { currency, ...(stamp && { onboardedAt: FieldValue.serverTimestamp() }) }, { merge: true });
  });
  return { currency };
}

/** Account settings from `users/{uid}`; any field the user never saved falls back to DEFAULT_SETTINGS. */
export async function getSettings(uid: string): Promise<AccountSettings> {
  await io();
  const data = (await users.doc(uid).get()).data() ?? {};
  const pick = <K extends keyof AccountSettings>(key: K): AccountSettings[K] => data[key] ?? DEFAULT_SETTINGS[key];
  return {
    accountName: pick("accountName"),
    balanceSgd: pick("balanceSgd"),
    accounts: pick("accounts"),
    tone: pick("tone"),
    language: pick("language"),
    voiceReplies: pick("voiceReplies"),
    trustedContact: pick("trustedContact"),
    savingsGoal: pick("savingsGoal"),
  };
}

/**
 * Replaces only the fields sent (null clears the contact or goal) and returns the full settings.
 * `addAccount` / `removeAccountId` change the extra accounts against what's stored. 409 when
 * removing an account that has a held transfer, which could then never be sent.
 */
export async function updateSettings(uid: string, { addAccount, removeAccountId, ...fields }: UpdateSettings): Promise<AccountSettings> {
  const ref = users.doc(uid);
  await db.runTransaction(async (tx) => {
    let accounts = accountsFrom((await tx.get(ref)).data()).slice(1);
    if (removeAccountId) {
      const held = await tx.get(
        ref.collection(COLLECTIONS.TRANSFERS).where("fromAccountId", "==", removeAccountId).where("status", "==", "warned").limit(1),
      );
      if (!held.empty) throw new ApiError(409, "CONFLICT", "Send or cancel the held transfer from this account first.");
      accounts = accounts.filter((a) => a.id !== removeAccountId);
    }
    if (addAccount) {
      if (accounts.length >= LIMITS.ACCOUNTS) throw new ApiError(409, "CONFLICT", `You can have up to ${LIMITS.ACCOUNTS} extra accounts.`);
      accounts = [...accounts, { id: randomUUID(), ...addAccount }];
    }
    const touched = addAccount || removeAccountId;
    // mergeFields swaps each sent field whole, so a new goal never keeps keys from the old one.
    tx.set(ref, { ...fields, ...(touched && { accounts }) }, { mergeFields: [...Object.keys(fields), ...(touched ? ["accounts"] : [])] });
  });
  return getSettings(uid);
}
