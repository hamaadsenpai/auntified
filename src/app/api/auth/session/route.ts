import { NextResponse, type NextRequest } from "next/server";
import { SESSION } from "@/constants";
import { isSameOrigin } from "@/lib/api/handler";
import { adminAuth } from "@/lib/firebase/admin";
import { upsertUserOnSignIn } from "@/server/repositories/users.repository";

function fail(status: number, code: string, message: string) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

/** Swaps a fresh Firebase ID token for an httpOnly session cookie. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return fail(403, "FORBIDDEN", "Bad origin.");

  const body = (await req.json().catch(() => null)) as { idToken?: unknown; acceptedTerms?: unknown } | null;
  const idToken = typeof body?.idToken === "string" ? body.idToken : null;
  if (!idToken) return fail(400, "BAD_REQUEST", "Missing ID token.");

  try {
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    // createSessionCookie only accepts tokens from a sign-in in the last 5 minutes.
    const cookie = await adminAuth.createSessionCookie(idToken, { expiresIn: SESSION.MAX_AGE_MS });
    await upsertUserOnSignIn(decoded, body?.acceptedTerms === true);

    const res = NextResponse.json({ success: true, data: { uid: decoded.uid } });
    res.cookies.set(SESSION.COOKIE, cookie, {
      maxAge: SESSION.MAX_AGE_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("[auth/session] sign-in failed", err);
    return fail(401, "UNAUTHORIZED", "Could not sign you in. Try again.");
  }
}

/** Logs out: revokes the user's refresh tokens (so the cookie dies everywhere) and clears it here. */
export async function DELETE(req: NextRequest) {
  if (!isSameOrigin(req)) return fail(403, "FORBIDDEN", "Bad origin.");

  const token = req.cookies.get(SESSION.COOKIE)?.value;
  if (token) {
    try {
      const decoded = await adminAuth.verifySessionCookie(token);
      await adminAuth.revokeRefreshTokens(decoded.sub);
    } catch {
      // Already invalid: clearing the cookie is all that's left to do.
    }
  }
  const res = NextResponse.json({ success: true, data: null });
  res.cookies.delete(SESSION.COOKIE);
  return res;
}
