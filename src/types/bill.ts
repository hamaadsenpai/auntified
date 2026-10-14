/** "me" is the signed-in user; anything else is one of their payee ids. */
export type Party = string;

/** One person's part of a bill. Payer is never in `shares`: their own part is `totalSgd` minus the shares. */
export type BillShare = {
  who: Party;
  /** Snapshot of the name, so the bill survives a payee being removed. "You" for "me". */
  name: string;
  amountSgd: number;
  /** When this share was paid back. Recorded only: no money moves. */
  settledAt: string | null;
};

/**
 * `users/{uid}/bills/{id}` as the client sees it.
 * request: the user asks one payee for money (paidBy "me", one share). split: a shared bill, Splitwise-style.
 */
export type Bill = {
  id: string;
  kind: "request" | "split";
  title: string;
  totalSgd: number;
  paidBy: Party;
  paidByName: string;
  shares: BillShare[];
  createdAt: string;
};

/** Body of POST /api/bills. Names are filled in by the server from the payees. */
export type CreateBill = {
  kind: "request" | "split";
  title: string;
  totalSgd: number;
  paidBy: Party;
  shares: { who: Party; amountSgd: number }[];
};

/** Body of PATCH /api/bills/[id]: marks these parties' shares settled (true) or open again (false). */
export type UpdateBill = { settle: Party[]; settled?: boolean };
