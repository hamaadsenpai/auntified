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
  ASK: "/api/ask",
} as const;

