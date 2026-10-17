import { withHandler } from "@/lib/api/handler";
import { mintGuardToken } from "@/server/guard/guard";
import { consumeAiQuota } from "@/server/repositories/users.repository";

/** A short-lived Gemini Live token for the browser's live call guard. */
export const POST = withHandler(
  async (_req, { user }) => {
    await consumeAiQuota(user.uid);
    return mintGuardToken();
  },
  { auth: true },
);
