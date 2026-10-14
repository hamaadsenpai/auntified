/** topup: money the user adds by hand. salary: a simulated pay day (also the first credit a new user gets). */
export type CreditKind = "topup" | "salary";

/** `users/{uid}/credits/{id}`: money paid into the demo account. Credits are never edited or deleted. */
export type Credit = {
  id: string;
  kind: CreditKind;
  amountSgd: number;
  /** The account paid into ("main" for credits made before there were several). */
  accountId: string;
  createdAt: string;
};

/** Body of POST /api/credits. */
export type CreateCredit = { kind: CreditKind; amountSgd: number; accountId: string };
