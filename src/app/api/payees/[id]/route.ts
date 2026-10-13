import { z } from "zod";
import { LIMITS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { deletePayee, getPayee, updatePayee } from "@/server/repositories/payees.repository";

const schema = z
  .object({
    name: z.string().trim().min(1).max(LIMITS.NAME),
    account: z.string().trim().min(1).max(LIMITS.ACCOUNT),
    note: z.string().trim().max(LIMITS.NOTE),
    reported: z.boolean(),
  })
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0);

/** One of the signed-in user's payees. */
export const GET = withHandler(
  async (_req, { params, user }) => {
    const payee = await getPayee(user.uid, (await params).id);
    if (!payee) throw ApiError.notFound("Payee not found.");
    return payee;
  },
  { auth: true },
);

/** Edits a payee's details, or marks it reported. */
export const PATCH = withHandler(
  async (req, { params, user }) => {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid payee.");
    return updatePayee(user.uid, (await params).id, parsed.data);
  },
  { auth: true },
);

/** Removes a payee; its past transfers stay. */
export const DELETE = withHandler(async (_req, { params, user }) => deletePayee(user.uid, (await params).id), {
  auth: true,
});
