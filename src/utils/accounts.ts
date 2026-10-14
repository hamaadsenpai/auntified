import type { Account, AccountSettings } from "@/types/settings";

export const MAIN_ACCOUNT_ID = "main";

/** Every account, the main one first. */
export const accountsOf = (s: Pick<AccountSettings, "accountName" | "balanceSgd" | "accounts">): Account[] => [
  { id: MAIN_ACCOUNT_ID, name: s.accountName, balanceSgd: s.balanceSgd },
  ...s.accounts,
];

/** Account `id`, or the main one if it has since been removed. */
export const accountOf = (s: Pick<AccountSettings, "accountName" | "balanceSgd" | "accounts">, id: string): Account =>
  accountsOf(s).find((a) => a.id === id) ?? accountsOf(s)[0];
