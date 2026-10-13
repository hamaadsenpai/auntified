import { z } from "zod";
import { EXPENSE_CATEGORIES, LIMITS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { createExpense, listExpenses } from "@/server/repositories/expenses.repository";

const schema = z
  .object({
    name: z.string().trim().min(1).max(LIMITS.NAME),
    category: z.enum(EXPENSE_CATEGORIES),
    amountSgd: z.number().finite().positive().max(LIMITS.MAX_AMOUNT_SGD),
    spentAt: z.iso.datetime({ offset: true }).optional(),
  })
  .strict();

/** The signed-in user's expenses, newest first. */
export const GET = withHandler(async (_req, { user }) => listExpenses(user.uid), { auth: true });

export const POST = withHandler(
  async (req, { user }) => {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid expense.");
    return createExpense(user.uid, parsed.data);
  },
  { auth: true },
);
