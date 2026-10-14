/**
 * pending: created on review, not checked yet. warned: held after a warn verdict.
 * passed / overridden: sent (balance debited). blocked / cancelled: never sent.
 * expired: left pending too long without a check; never sent.
 */
export type TransferStatus = "pending" | "warned" | "passed" | "overridden" | "blocked" | "cancelled" | "expired";

import type { RiskSignal } from "./check";

/** The user's case for a blocked transfer. Recorded only: the block stays and nothing is sent. */
export type TransferAppeal = { reason: string; at: string };

/** The trusted contact Auntie alerted when she warned about or blocked this transfer. */
export type ContactAlert = { name: string; phone: string; at: string };

/** A bank analyst's decision on a flagged transfer. approve sends it; hold stops "pay anyway"; report blocks it and marks the payee. */
export type ReviewAction = "approve" | "hold" | "report";
export type TransferReview = { action: ReviewAction; at: string };

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
  /** The same flags with reason codes and weights (empty on transfers made before there were any). */
  signals: RiskSignal[];
  rulesScore: number;
  /** Filled in once Auntie's check finishes. */
  modelScore: number | null;
  score: number | null;
  reasons: string[];
  /** Auntie's one-sentence sum-up of the reasons, once her check finishes. */
  summary: string | null;
  /** Set once the user appeals a block. */
  appeal: TransferAppeal | null;
  /** A warned transfer can't be sent anyway until then (the cooling-off period). */
  holdUntil: string | null;
  contactAlert: ContactAlert | null;
  review: TransferReview | null;
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
