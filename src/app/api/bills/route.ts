import { z } from "zod";
import { LIMITS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { createBill, listBills } from "@/server/repositories/bills.repository";

const cents = (sgd: number) => Math.round(sgd * 100);
/** At most 2 decimals, allowing for float noise. */
const isCents = (sgd: number) => Math.abs(sgd * 100 - cents(sgd)) < 1e-6;

const schema = z
  .object({
    kind: z.enum(["request", "split"]),
    title: z.string().trim().min(1).max(LIMITS.REFERENCE),
    totalSgd: z.number().finite().positive().max(LIMITS.MAX_AMOUNT_SGD),
    paidBy: z.string().min(1).max(128),
    shares: z
      .array(z.object({ who: z.string().min(1).max(128), amountSgd: z.number().finite().positive() }).strict())
      .min(1)
      .max(20),
  })
  .strict()
  .refine(({ kind, totalSgd, paidBy, shares }) => {
    const who = shares.map((s) => s.who);
    // The payer's own part is whatever the shares leave of the total.
    const owed = shares.reduce((sum, s) => sum + cents(s.amountSgd), 0);
    if (new Set(who).size !== who.length || who.includes(paidBy) || owed > cents(totalSgd)) return false;
    if (!isCents(totalSgd) || !shares.every((s) => isCents(s.amountSgd))) return false;
    return kind === "split" || (paidBy === "me" && shares.length === 1 && cents(shares[0].amountSgd) === cents(totalSgd));
  });

/** The signed-in user's bills and money requests, newest first. */
export const GET = withHandler(async (_req, { user }) => listBills(user.uid), { auth: true });

/** Records a money request or a split bill. No money moves. */
export const POST = withHandler(
  async (req, { user }) => {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid bill.");
    return createBill(user.uid, parsed.data);
  },
  { auth: true },
);
