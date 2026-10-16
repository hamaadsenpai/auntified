import { z } from "zod";
import { LIMITS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { consumeAiQuota } from "@/server/repositories/users.repository";
import { scanMessage } from "@/server/scan/scan";

// The image types Gemini reads.
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/heic", "image/heif"] as const;

const schema = z
  .object({
    text: z.string().trim().max(LIMITS.SCAN_TEXT).optional(),
    image: z
      .object({
        mimeType: z.enum(IMAGE_TYPES),
        data: z.base64().max(Math.ceil(LIMITS.UPLOAD_BYTES / 3) * 4),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine((body) => Boolean(body.text) || body.image !== undefined);

/** Auntie's scam read of a message the user received: pasted text, a screenshot, or both. */
export const POST = withHandler(
  async (req, { user }) => {
    await consumeAiQuota(user.uid);
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Paste a message or add a screenshot under 4 MB.");
    return scanMessage(user.uid, parsed.data);
  },
  { auth: true },
);
