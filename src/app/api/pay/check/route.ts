import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { runQuickCheck } from "@/server/check/quick-check";

const schema = z
  .object({
    transferId: z.string().min(1).max(128),
    transcript: z
      .array(z.object({ role: z.enum(["auntie", "user"]), text: z.string().trim().min(1).max(500) }).strict())
      .max(8),
  })
  .strict();

/** One turn of Auntie's quick check on the user's pending transfer, scored by Gemini on top of the rule flags. */
export const POST = withHandler(
  async (req, { user }) => {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid check.");
    return runQuickCheck(user.uid, parsed.data.transferId, parsed.data.transcript);
  },
  { auth: true },
);
