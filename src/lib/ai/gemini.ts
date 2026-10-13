import "server-only";
import { ApiError, GoogleGenAI, type GenerateContentParameters } from "@google/genai";
import { env } from "@/lib/env.server";

// One client per server process; it holds no per-request state. Short retries on 408/429/5xx:
// the user is waiting on screen, so fail over to the next model fast instead of backing off long.
export const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
  httpOptions: { timeout: 20_000, retryOptions: { attempts: 2, initialDelay: 0.5, maxDelay: 2 } },
});

const MODELS = [env.GEMINI_MODEL, env.GEMINI_FALLBACK_MODEL].filter((m, i, all) => m && all.indexOf(m) === i);

/** Overload or outage on Google's side: worth trying another model. Bad key or bad request is not. */
function isTransient(err: unknown) {
  return err instanceof ApiError && (err.status === 429 || err.status >= 500);
}

/** generateContent on the primary model, falling back to the next one when it is overloaded. */
export async function generate(params: Omit<GenerateContentParameters, "model">) {
  let lastErr: unknown;
  for (const model of MODELS) {
    try {
      return await gemini.models.generateContent({ ...params, model });
    } catch (err) {
      lastErr = err;
      if (!isTransient(err)) break;
      console.warn(`[gemini] ${model} unavailable, trying next model`);
    }
  }
  throw lastErr;
}
