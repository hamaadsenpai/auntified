import type { AccountSettings } from "@/types/settings";

export const EXPENSE_CATEGORIES = [
  "Food delivery",
  "Rides",
  "Bubble tea",
  "Subscriptions",
  "Shopping",
  "Groceries",
  "Other",
] as const;

/** What a user who has saved nothing sees. The server and client both fall back to these. */
export const DEFAULT_SETTINGS: AccountSettings = {
  accountName: "Everyday Account",
  balanceSgd: 0,
  tone: "roast",
  language: "Singlish",
  voiceReplies: true,
  trustedContact: null,
  savingsGoal: null,
};

/** Validation limits shared by the forms and the zod schemas. */
export const LIMITS = {
  NAME: 60,
  ACCOUNT: 40,
  NOTE: 40,
  REFERENCE: 140,
  APPEAL: 500,
  MAX_AMOUNT_SGD: 10_000_000,
} as const;
