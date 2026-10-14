import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { deleteBill, updateBill } from "@/server/repositories/bills.repository";

const schema = z
  .object({
    settle: z.array(z.string().min(1).max(128)).min(1).max(20),
    settled: z.boolean().optional(),
  })
  .strict();

/** Marks parties' shares settled, or open again. Records only: balance is not changed. */
export const PATCH = withHandler(
  async (req, { params, user }) => {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid bill.");
    return updateBill(user.uid, (await params).id, parsed.data);
  },
  { auth: true },
);

/** Removes a bill. */
export const DELETE = withHandler(async (_req, { params, user }) => deleteBill(user.uid, (await params).id), {
  auth: true,
});
