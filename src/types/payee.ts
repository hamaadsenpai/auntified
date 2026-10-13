/** `users/{uid}/payees/{id}` as the client sees it. */
export type Payee = {
  id: string;
  name: string;
  /** How the bank reaches them, as entered, e.g. "PayNow 9123 8821". */
  account: string;
  /** Who they are to the user, e.g. "Mum". May be "". */
  note: string;
  /** The user reported this payee as a scam. */
  reported: boolean;
  createdAt: string;
  /** Completed transfers (passed or overridden) and their total. Kept by the server. */
  transferCount: number;
  totalSentSgd: number;
};

/** Body of POST /api/payees. */
export type CreatePayee = { name: string; account: string; note?: string };

/** Body of PATCH /api/payees/[id]. */
export type UpdatePayee = Partial<{ name: string; account: string; note: string; reported: boolean }>;
