import { z } from "zod";
import { LIMITS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { consumeAiQuota } from "@/server/repositories/users.repository";
import { importStatement } from "@/server/statements/statement";

const schema = z
  .object({
    mimeType: z.enum(["application/pdf", "text/csv"]),
    data: z.base64().max(Math.ceil(LIMITS.UPLOAD_BYTES / 3) * 4),
  })
  .strict();

/** Reads a PDF or CSV bank statement into the user's expenses, with categories and recurring bills marked. */
export const POST = withHandler(
  async (req, { user }) => {
    await consumeAiQuota(user.uid);
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Upload a PDF or CSV statement under 4 MB.");
    return importStatement(user.uid, parsed.data);
  },
  { auth: true },
);
