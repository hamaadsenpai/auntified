import "server-only";
import { gemini } from "@/lib/ai/gemini";
import { ApiError } from "@/lib/api/errors";
import { env } from "@/lib/env.server";
import type { GuardToken } from "@/types/guard";

/** A single-use Gemini Live token, so the browser never sees the API key. */
export async function mintGuardToken(): Promise<GuardToken> {
  const now = Date.now();
  let name: string | undefined;
  try {
    const tok = await gemini.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(now + 30 * 60_000).toISOString(),
        newSessionExpireTime: new Date(now + 60_000).toISOString(),
        httpOptions: { apiVersion: "v1alpha" },
      },
    });
    name = tok.name;
  } catch (err) {
    console.error("[guard] Gemini token mint failed", err);
    throw new ApiError(502, "AI_UNAVAILABLE", "Auntie can't listen right now. Try again in a moment.");
  }
  if (!name) {
    console.error("[guard] Gemini returned no token");
    throw new ApiError(502, "AI_UNAVAILABLE", "Auntie can't listen right now. Try again in a moment.");
  }
  return { token: name, model: env.GEMINI_LIVE_MODEL };
}
