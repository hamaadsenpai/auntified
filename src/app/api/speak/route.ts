import { z } from "zod";
import { LANGUAGES } from "@/features/settings/languages";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { consumeAiQuota } from "@/server/repositories/users.repository";
import { speakText } from "@/server/speak/speak";

const schema = z
  .object({
    text: z.string().trim().min(1).max(1000),
    language: z.string().refine((l) => LANGUAGES.includes(l)),
  })
  .strict();

/** Auntie's voice: the text read aloud by Gemini TTS, as WAV audio in a data URL. */
export const POST = withHandler(
  async (req, { user }) => {
    await consumeAiQuota(user.uid);
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid speech.");
    return speakText(parsed.data.text);
  },
  { auth: true },
);
