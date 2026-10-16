import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { askAuntie } from "@/server/ask/ask";
import { consumeAiQuota } from "@/server/repositories/users.repository";

const schema = z
  .object({
    transcript: z
      .array(z.object({ role: z.enum(["auntie", "user"]), text: z.string().trim().min(1).max(500) }).strict())
      .min(1)
      .max(20)
      .refine((turns) => turns.at(-1)?.role === "user"),
  })
  .strict();

/** Ask Auntie: one reply to the user's latest question, grounded in their own account data. */
export const POST = withHandler(
  async (req, { user }) => {
    await consumeAiQuota(user.uid);
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid question.");
    return askAuntie(user.uid, parsed.data.transcript);
  },
  { auth: true },
);
