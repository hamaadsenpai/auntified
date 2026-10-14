import { z } from "zod";
import { LIMITS } from "@/constants";
import { LANGUAGES } from "@/features/settings/languages";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { getSettings, updateSettings } from "@/server/repositories/users.repository";
import { MAIN_ACCOUNT_ID } from "@/utils/accounts";

const amount = z.number().finite().min(0).max(LIMITS.MAX_AMOUNT_SGD);

const schema = z
  .object({
    accountName: z.string().trim().min(1).max(LIMITS.NAME),
    balanceSgd: amount,
    addAccount: z.object({ name: z.string().trim().min(1).max(LIMITS.NAME), balanceSgd: amount }).strict(),
    removeAccountId: z.string().min(1).max(64).refine((id) => id !== MAIN_ACCOUNT_ID),
    tone: z.enum(["roast", "gentle"]),
    language: z.string().refine((l) => LANGUAGES.includes(l)),
    voiceReplies: z.boolean(),
    trustedContact: z
      .object({
        name: z.string().trim().min(1).max(LIMITS.NAME),
        relation: z.string().trim().max(LIMITS.NOTE),
        phone: z.string().trim().min(3).max(30),
      })
      .strict()
      .nullable(),
    savingsGoal: z
      .object({
        targetSgd: amount.positive(),
        savedSgd: amount,
        deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .strict()
      .nullable(),
    lockedSgd: amount,
  })
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0);

/** The signed-in user's account settings, with defaults for anything never saved. */
export const GET = withHandler(async (_req, { user }) => getSettings(user.uid), { auth: true });

/** Saves the fields sent and returns the full settings. */
export const PATCH = withHandler(
  async (req, { user }) => {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid settings.");
    return updateSettings(user.uid, parsed.data);
  },
  { auth: true },
);
