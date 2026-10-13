import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, SESSION } from "@/constants";

/**
 * Optimistic check only: is there a session cookie at all? The real verification
 * (signature, expiry, revocation) happens in `requireUser()` on the server.
 */
export function proxy(req: NextRequest) {
  if (req.cookies.has(SESSION.COOKIE)) return NextResponse.next();
  const login = new URL(ROUTES.LOGIN, req.url);
  login.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(login);
}

// Must be static literals. These are the (app) route group's pages.
export const config = {
  matcher: [
    "/home/:path*",
    "/ask/:path*",
    "/demo/:path*",
    "/ledger/:path*",
    "/onboarding/:path*",
    "/patterns/:path*",
    "/pay/:path*",
    "/payees/:path*",
    "/roast/:path*",
    "/settings/:path*",
  ],
};
