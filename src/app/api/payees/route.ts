import { z } from "zod";
import { LIMITS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { createPayee, listPayees } from "@/server/repositories/payees.repository";

const schema = z
  .object({
    name: z.string().trim().min(1).max(LIMITS.NAME),
    account: z.string().trim().min(1).max(LIMITS.ACCOUNT),
    note: z.string().trim().max(LIMITS.NOTE).optional(),
  })
  .strict();

/** The signed-in user's payees, newest first. */
export const GET = withHandler(async (_req, { user }) => listPayees(user.uid), { auth: true });

/** Adds a payee. */
export const POST = withHandler(
  async (req, { user }) => {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid payee.");
    return createPayee(user.uid, parsed.data);
  },
  { auth: true },
);
