import { z } from "zod";
import { LIMITS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { addCredit, listCredits } from "@/server/repositories/credits.repository";

const schema = z
  .object({
    kind: z.enum(["topup", "salary"]),
    amountSgd: z.number().finite().positive().max(LIMITS.MAX_AMOUNT_SGD),
    accountId: z.string().min(1).max(64),
  })
  .strict();

/** The signed-in user's credits (top-ups and pay days), newest first. */
export const GET = withHandler(async (_req, { user }) => listCredits(user.uid), { auth: true });

/** Adds money to the demo balance. */
export const POST = withHandler(
  async (req, { user }) => {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid top-up.");
    return addCredit(user.uid, parsed.data);
  },
  { auth: true },
);
