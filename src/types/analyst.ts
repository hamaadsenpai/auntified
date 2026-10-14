import type { ReviewAction, Transfer } from "./transfer";

/** A warned or blocked transfer in the bank analyst queue, with whose it is. */
export type FlaggedTransfer = Transfer & { uid: string; userEmail: string | null };

/** Body of POST /api/analyst. */
export type ReviewRequest = { uid: string; transferId: string; action: ReviewAction };
