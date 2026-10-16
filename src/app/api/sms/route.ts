import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { LIMITS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { findUidBySmsKey } from "@/server/repositories/sms-keys.repository";
import { forwardSms } from "@/server/sms/forward-sms";

// Not strict: extra fields a Shortcut might send are ignored.
const schema = z.object({
  message: z.string().trim().max(LIMITS.SCAN_TEXT),
  sender: z.string().trim().max(LIMITS.NAME).optional(),
});

/**
 * The usual failure envelope, plus `data.show`/`data.notification`: the Shortcut reads those keys
 * on every reply, so an error shows up as a notification instead of crashing the Shortcut.
 */
function failForShortcut(err: unknown) {
  const known = err instanceof ApiError;
  if (!known) console.error("[sms] unhandled error", err);
  const code = known ? err.code : "INTERNAL";
  const message = known ? err.message : "Something went wrong. Try again.";
  return NextResponse.json(
    { success: false, error: { code, message }, data: { show: "yes", notification: `Auntie couldn't check a text: ${message}` } },
    { status: known ? err.status : 500 },
  );
}

/**
 * Called by the iPhone Shortcut, not the browser: `Authorization: Bearer <SMS key>` from Settings,
 * body `{ "message": "<SMS text>", "sender": "<who sent it>" }`. No cookie is involved, so there's
 * no CSRF origin check here.
 */
export async function POST(req: NextRequest) {
  try {
    const key = req.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
    if (!key) throw ApiError.unauthorized("Missing SMS key.");
    const uid = await findUidBySmsKey(key);
    if (!uid) throw ApiError.unauthorized("This SMS key is not valid. Create a new one in Settings.");
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest('Send JSON like { "message": "<SMS text>", "sender": "<sender>" }.');
    // Tapping ▶️ in Shortcuts runs it with no input, so this is usually a test run, not a broken setup.
    if (!parsed.data.message) {
      throw ApiError.badRequest("the text was empty. Tapping ▶️ in Shortcuts sends nothing; send yourself a text to test.");
    }
    return ok(await forwardSms(uid, parsed.data));
  } catch (err) {
    return failForShortcut(err);
  }
}
