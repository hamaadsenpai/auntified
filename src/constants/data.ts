import type { AccountSettings } from "@/types/settings";

export const EXPENSE_CATEGORIES = [
  "Food delivery",
  "Rides",
  "Bubble tea",
  "Subscriptions",
  "Bills",
  "Insurance",
  "Shopping",
  "Groceries",
  "Other",
] as const;

/** What a user who has saved nothing sees. The server and client both fall back to these. */
export const DEFAULT_SETTINGS: AccountSettings = {
  accountName: "Everyday Account",
  balanceSgd: 0,
  accounts: [],
  tone: "roast",
  language: "Singlish",
  voiceReplies: true,
  trustedContact: null,
  savingsGoal: null,
  lockedSgd: 0,
};

/** How long a warned transfer waits before the user can send it anyway. */
export const COOL_OFF_HOURS = 12;

/** The simulated monthly salary: a new user's first credit, and the Settings "Pay salary" amount. */
export const SALARY_SGD = 3500;

/** Validation limits shared by the forms and the zod schemas. */
export const LIMITS = {
  NAME: 60,
  ACCOUNT: 40,
  /** Extra accounts beside the main one. */
  ACCOUNTS: 5,
  NOTE: 40,
  REFERENCE: 140,
  APPEAL: 500,
  MAX_AMOUNT_SGD: 10_000_000,
  /** A message pasted into the scam scanner. */
  SCAN_TEXT: 2000,
  /** A screenshot for the scanner, or a bank statement to import. */
  UPLOAD_BYTES: 4 * 1024 * 1024,
} as const;
