export const SESSION = {
  COOKIE: "session",
  /** Firebase allows 5 minutes to 14 days. */
  MAX_AGE_MS: 5 * 24 * 60 * 60 * 1000,
} as const;

export const COLLECTIONS = {
  USERS: "users",
  /** Subcollections of users/{uid}. */
  PAYEES: "payees",
  TRANSFERS: "transfers",
  EXPENSES: "expenses",
  BILLS: "bills",
  CREDITS: "credits",
  /** Texts forwarded by the iPhone Shortcut and scam-checked: users/{uid}/smsScans. */
  SMS_SCANS: "smsScans",
  /** Top level: smsKeys/{sha256 of key} → { uid }, so the SMS endpoint can find the user from a key. */
  SMS_KEYS: "smsKeys",
} as const;

export const ENDPOINTS = {
  SESSION: "/api/auth/session",
  PREFERENCES: "/api/me/preferences",
  PAY_CHECK: "/api/pay/check",
  SETTINGS: "/api/me/settings",
  PAYEES: "/api/payees",
  PAYEE: (id: string) => `/api/payees/${encodeURIComponent(id)}`,
  TRANSFERS: "/api/transfers",
  TRANSFER: (id: string) => `/api/transfers/${encodeURIComponent(id)}`,
  EXPENSES: "/api/expenses",
  EXPENSE: (id: string) => `/api/expenses/${encodeURIComponent(id)}`,
  BILLS: "/api/bills",
  BILL: (id: string) => `/api/bills/${encodeURIComponent(id)}`,
  CREDITS: "/api/credits",
  ASK: "/api/ask",
  ROAST: "/api/roast",
  SPEAK: "/api/speak",
  GUARD_TOKEN: "/api/guard/token",
  DEMO: "/api/demo",
  SCAN: "/api/scan",
  SMS_KEY: "/api/me/sms-key",
  /** Called by the iPhone Shortcut with a bearer key, not the session cookie. */
  SMS_IMPORT: "/api/sms",
  SMS_SCANS: "/api/sms/scans",
  SMS_SCAN: (id: string) => `/api/sms/scans/${encodeURIComponent(id)}`,
  ANALYST: "/api/analyst",
  STATEMENTS: "/api/statements",
} as const;

