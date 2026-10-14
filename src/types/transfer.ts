/**
 * pending: created on review, not checked yet. warned: held after a warn verdict.
 * passed / overridden: sent (balance debited). blocked / cancelled: never sent.
 * expired: left pending too long without a check; never sent.
 */
export type TransferStatus = "pending" | "warned" | "passed" | "overridden" | "blocked" | "cancelled" | "expired";

/** The user's case for a blocked transfer. Recorded only: the block stays and nothing is sent. */
export type TransferAppeal = { reason: string; at: string };

/** `users/{uid}/transfers/{id}` as the client sees it. */
export type Transfer = {
  id: string;
  payeeId: string;
  /** Snapshot of the payee name, so history survives a payee being removed. */
  payeeName: string;
  amountSgd: number;
  reference: string;
  /** The account that pays ("main" for transfers made before there were several). */
  fromAccountId: string;
  status: TransferStatus;
  /** Rule flags and their score, worked out when the transfer is created or edited. */
  flags: string[];
  rulesScore: number;
  /** Filled in once Auntie's check finishes. */
  modelScore: number | null;
  score: number | null;
  reasons: string[];
  /** Set once the user appeals a block. */
  appeal: TransferAppeal | null;
  createdAt: string;
  updatedAt: string;
};

/** Body of POST /api/transfers. */
export type CreateTransfer = { payeeId: string; amountSgd: number; reference: string; fromAccountId: string };

/**
 * Body of PATCH /api/transfers/[id]. Details can change only while pending.
 * status "cancelled" from pending or warned; "overridden" (pay anyway) from warned only.
 * appealReason appeals a block, once, and goes on its own.
 */
export type UpdateTransfer = Partial<{
  payeeId: string;
  amountSgd: number;
  reference: string;
  fromAccountId: string;
  status: "cancelled" | "overridden";
  appealReason: string;
}>;
