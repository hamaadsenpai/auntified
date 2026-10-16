import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { ENDPOINTS } from "@/constants";
import { getClientAuth } from "@/lib/firebase/client";

/** Hands the fresh ID token to the server, which sets the httpOnly session cookie. */
async function startSession(user: User, acceptedTerms = false) {
  // force=true so a name just set with updateProfile is in the token's claims.
  const idToken = await user.getIdToken(true);
  const res = await fetch(ENDPOINTS.SESSION, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, acceptedTerms }),
  });
  // The cookie is the session now; drop the in-memory client user either way.
  await signOut(getClientAuth());
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? "Could not sign you in. Try again.");
  }
}

export const authService = {
  async signInWithEmail(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(getClientAuth(), email, password);
    await startSession(user);
  },

  async signUpWithEmail(name: string, email: string, password: string, acceptedTerms: boolean) {
    const { user } = await createUserWithEmailAndPassword(getClientAuth(), email, password);
    if (name) await updateProfile(user, { displayName: name });
    await startSession(user, acceptedTerms);
  },

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const { user } = await signInWithPopup(getClientAuth(), provider);
    await startSession(user);
  },

  async sendPasswordReset(email: string) {
    await sendPasswordResetEmail(getClientAuth(), email);
  },

  async signOut() {
    await fetch(ENDPOINTS.SESSION, { method: "DELETE" });
  },
};

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "That email and password don't match.",
  "auth/invalid-email": "That email doesn't look right.",
  "auth/missing-email": "Type your email first, then tap Forgot password.",
  "auth/user-disabled": "This account has been switched off.",
  "auth/email-already-in-use": "There's already an account with that email. Log in instead.",
  "auth/weak-password": "Pick a stronger password, at least 8 characters.",
  "auth/too-many-requests": "Too many tries. Wait a minute and try again.",
  "auth/network-request-failed": "Can't reach the server. Check your connection.",
  "auth/popup-blocked": "Your browser blocked the Google window. Allow pop-ups and try again.",
  "auth/account-exists-with-different-credential": "That email already signs in another way. Use email and password.",
  "auth/operation-not-allowed": "That sign-in method isn't switched on yet.",
};

/** Turns an auth error into a sentence for the form. Returns null when there's nothing to show. */
export function authErrorMessage(err: unknown): string | null {
  if (err instanceof FirebaseError) {
    // The user closed the Google window themselves; not an error worth showing.
    if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") return null;
    return MESSAGES[err.code] ?? "Something went wrong. Try again.";
  }
  return err instanceof Error ? err.message : "Something went wrong. Try again.";
}

/** Only allow same-site paths, so `?next=` can't send people to another domain. */
export function safeNextPath(raw: string | null, fallback: string) {
  if (raw === null) return fallback;
  // Let the URL parser decide, since it strips tabs and backslashes that prefix checks miss.
  try {
    const url = new URL(raw, location.origin);
    return url.origin === location.origin ? url.pathname + url.search + url.hash : fallback;
  } catch {
    return fallback;
  }
}
