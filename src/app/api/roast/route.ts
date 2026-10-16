import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { consumeAiQuota } from "@/server/repositories/users.repository";
import { roastWeek } from "@/server/roast/roast";

const MAX_SPAN_MS = 8 * 24 * 60 * 60 * 1000;

const schema = z
  .object({ from: z.iso.datetime({ offset: true }), to: z.iso.datetime({ offset: true }) })
  .strict()
  .refine(({ from, to }) => {
    const span = Date.parse(to) - Date.parse(from);
    return span > 0 && span <= MAX_SPAN_MS;
  });

/** Auntie's roast of the viewer's week, written from their own expenses. */
export const POST = withHandler(
  async (req, { user }) => {
    await consumeAiQuota(user.uid);
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid week.");
    return roastWeek(user.uid, new Date(parsed.data.from), new Date(parsed.data.to));
  },
  { auth: true },
);
