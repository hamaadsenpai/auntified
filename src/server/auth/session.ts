import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROUTES, SESSION } from "@/constants";
import { adminAuth } from "@/lib/firebase/admin";
import type { SessionUser } from "@/types/auth";

/**
 * Verifies the session cookie. Reads cookies, so with cacheComponents every caller must render
 * inside a <Suspense> boundary. `use cache: private` dedupes it per request and allows the
 * clock read inside token verification; the result never lands in a server cache.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  "use cache: private";
  const token = (await cookies()).get(SESSION.COOKIE)?.value;
  if (!token) return null;
  try {
    // true = also reject cookies whose refresh tokens were revoked (logout, disabled account).
    const decoded = await adminAuth.verifySessionCookie(token, true);
    return { uid: decoded.uid, email: decoded.email ?? null, name: (decoded.name as string | undefined) ?? null };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.LOGIN);
  return user;
}
