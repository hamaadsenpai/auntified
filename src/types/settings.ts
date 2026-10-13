export type Tone = "roast" | "gentle";

export type TrustedContact = { name: string; relation: string; phone: string };

/** `deadline` is a calendar date, "YYYY-MM-DD". */
export type SavingsGoal = { targetSgd: number; savedSgd: number; deadline: string };

/** Account settings on `users/{uid}`. Defaults apply until the user saves something. */
export type AccountSettings = {
  accountName: string;
  balanceSgd: number;
  tone: Tone;
  language: string;
  voiceReplies: boolean;
  trustedContact: TrustedContact | null;
  savingsGoal: SavingsGoal | null;
};

/** Body of PATCH /api/me/settings. null clears the contact or goal. */
export type UpdateSettings = Partial<AccountSettings>;
