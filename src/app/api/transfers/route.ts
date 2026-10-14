import { z } from "zod";
import { LIMITS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { createTransfer, listTransfers } from "@/server/repositories/transfers.repository";

const schema = z
  .object({
    payeeId: z.string().min(1).max(128),
    amountSgd: z.number().positive().max(LIMITS.MAX_AMOUNT_SGD),
    reference: z.string().trim().max(LIMITS.REFERENCE),
    fromAccountId: z.string().min(1).max(64),
  })
  .strict();

/** The signed-in user's transfers, newest first. */
export const GET = withHandler(async (_req, { user }) => listTransfers(user.uid), { auth: true });

/** Holds a new transfer as pending, with its rule flags, until Auntie's check. */
export const POST = withHandler(
  async (req, { user }) => {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid transfer.");
    return createTransfer(user.uid, parsed.data);
  },
  { auth: true },
);
