import { z } from "zod";
import { isCurrencyCode } from "@/constants/currencies";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { updateUserPreferences } from "@/server/repositories/users.repository";

const schema = z
  .object({
    currency: z.string().refine(isCurrencyCode),
    completeOnboarding: z.literal(true).optional(),
  })
  .strict();

/** Saves the signed-in user's currency, and finishes onboarding when asked. */
export const PATCH = withHandler(
  async (req, { user }) => {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid preferences.");
    return updateUserPreferences(user.uid, parsed.data);
  },
  { auth: true },
);
