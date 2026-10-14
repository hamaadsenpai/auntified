import { z } from "zod";
import { LIMITS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { deleteTransfer, getTransfer, updateTransfer } from "@/server/repositories/transfers.repository";

const schema = z
  .object({
    payeeId: z.string().min(1).max(128),
    amountSgd: z.number().positive().max(LIMITS.MAX_AMOUNT_SGD),
    reference: z.string().trim().max(LIMITS.REFERENCE),
    fromAccountId: z.string().min(1).max(64),
    status: z.enum(["cancelled", "overridden"]),
    appealReason: z.string().trim().min(1).max(LIMITS.APPEAL),
  })
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0)
  // An appeal is its own action, never mixed with an edit or a status change.
  .refine((body) => body.appealReason === undefined || Object.keys(body).length === 1);

/** One of the signed-in user's transfers. */
export const GET = withHandler(
  async (_req, { params, user }) => {
    const transfer = await getTransfer(user.uid, (await params).id);
    if (!transfer) throw ApiError.notFound("Transfer not found.");
    return transfer;
  },
  { auth: true },
);

/** Edits a pending transfer, cancels it, sends a held one anyway, or appeals a block. */
export const PATCH = withHandler(
  async (req, { params, user }) => {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid transfer.");
    return updateTransfer(user.uid, (await params).id, parsed.data);
  },
  { auth: true },
);

/** Removes a transfer from history. */
export const DELETE = withHandler(async (_req, { params, user }) => deleteTransfer(user.uid, (await params).id), {
  auth: true,
});
