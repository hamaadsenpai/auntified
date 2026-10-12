// Client SDK: sign-in only. Data reads/writes go through firebase-admin on the server.
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { publicEnv } from "@/lib/env.client";

// getApps() stops hot reload from initializing a second app.
export const firebaseApp = getApps().length ? getApp() : initializeApp(publicEnv.FIREBASE);
export const auth = getAuth(firebaseApp);

let analytics: Promise<Analytics | null> | undefined;

// Analytics touches window/cookies, so it only starts in a supported browser.
export function getClientAnalytics() {
  if (typeof window === "undefined") return Promise.resolve(null);
  analytics ??= isSupported().then((ok) => (ok ? getAnalytics(firebaseApp) : null));
  return analytics;
}
