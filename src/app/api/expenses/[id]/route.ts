import { z } from "zod";
import { EXPENSE_CATEGORIES, LIMITS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { deleteExpense, updateExpense } from "@/server/repositories/expenses.repository";

const schema = z
  .object({
    name: z.string().trim().min(1).max(LIMITS.NAME),
    category: z.enum(EXPENSE_CATEGORIES),
    amountSgd: z.number().finite().positive().max(LIMITS.MAX_AMOUNT_SGD),
    spentAt: z.iso.datetime({ offset: true }),
  })
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0);

export const PATCH = withHandler(
  async (req, { user, params }) => {
    const { id } = await params;
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid expense.");
    const expense = await updateExpense(user.uid, id, parsed.data);
    if (!expense) throw ApiError.notFound("Expense not found.");
    return expense;
  },
  { auth: true },
);

export const DELETE = withHandler(
  async (_req, { user, params }) => {
    const { id } = await params;
    if (!(await deleteExpense(user.uid, id))) throw ApiError.notFound("Expense not found.");
    return { id };
  },
  { auth: true },
);
