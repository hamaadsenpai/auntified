// Client SDK: sign-in only. Data reads/writes go through firebase-admin on the server.
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { browserPopupRedirectResolver, getAuth, inMemoryPersistence, initializeAuth, type Auth } from "firebase/auth";
import { publicEnv } from "@/lib/env.client";

// getApps() stops hot reload from initializing a second app.
export const firebaseApp = getApps().length ? getApp() : initializeApp(publicEnv.FIREBASE);

let auth: Auth | undefined;

/**
 * Browser-only, so call it from event handlers. In-memory persistence: the httpOnly session
 * cookie is the only thing that keeps a user signed in, so nothing lingers in IndexedDB.
 */
export function getClientAuth() {
  if (!auth) {
    try {
      auth = initializeAuth(firebaseApp, { persistence: inMemoryPersistence, popupRedirectResolver: browserPopupRedirectResolver });
    } catch {
      // Hot reload re-runs this module after Auth already exists for the app.
      auth = getAuth(firebaseApp);
    }
  }
  return auth;
}

let analytics: Promise<Analytics | null> | undefined;

// Analytics touches window/cookies, so it only starts in a supported browser.
export function getClientAnalytics() {
  if (typeof window === "undefined") return Promise.resolve(null);
  analytics ??= isSupported().then((ok) => (ok ? getAnalytics(firebaseApp) : null));
  return analytics;
}
