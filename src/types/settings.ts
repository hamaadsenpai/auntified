export type Tone = "roast" | "gentle";

export type TrustedContact = { name: string; relation: string; phone: string };

/** `deadline` is a calendar date, "YYYY-MM-DD". */
export type SavingsGoal = { targetSgd: number; savedSgd: number; deadline: string };

/** A bank account. The main one ("main") is `accountName`/`balanceSgd`; extra ones live in `accounts`. */
export type Account = { id: string; name: string; balanceSgd: number };

/** Account settings on `users/{uid}`. Defaults apply until the user saves something. */
export type AccountSettings = {
  accountName: string;
  balanceSgd: number;
  /** Extra accounts after the main one. Their balances move only through top-ups and transfers. */
  accounts: Account[];
  tone: Tone;
  language: string;
  voiceReplies: boolean;
  trustedContact: TrustedContact | null;
  savingsGoal: SavingsGoal | null;
};

/**
 * Body of PATCH /api/me/settings. null clears the contact or goal. Extra accounts are added
 * (the server picks the id) or removed one at a time, never sent whole, so a stale copy can't undo another tab.
 */
export type UpdateSettings = Partial<Omit<AccountSettings, "accounts">> & {
  addAccount?: Omit<Account, "id">;
  removeAccountId?: string;
};
