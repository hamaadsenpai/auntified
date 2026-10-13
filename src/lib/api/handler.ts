import "server-only";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import type { SessionUser } from "@/types/auth";
import { ApiError } from "./errors";
import { fail, ok } from "./response";

type Ctx = { params: Promise<Record<string, string>> };

/**
 * Cookie auth needs a CSRF guard: only accept mutations sent from our own pages.
 * Behind a proxy (Cloud Run) `nextUrl.origin` is the bind address, e.g. https://0.0.0.0:8080,
 * so the public origin is rebuilt from the forwarded headers.
 */
export function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0] ?? req.nextUrl.protocol.slice(0, -1);
  return origin !== null && origin === `${proto}://${host}`;
}

function assertSameOrigin(req: NextRequest) {
  if (!isSameOrigin(req)) throw ApiError.forbidden("Bad origin.");
}

/** Wraps a route handler: CSRF check, optional auth, envelope and safe errors in one place. */
export function withHandler<T, A extends boolean = false>(
  fn: (req: NextRequest, ctx: Ctx & (A extends true ? { user: SessionUser } : { user?: SessionUser })) => Promise<T>,
  opts: { auth?: A } = {},
) {
  return async (req: NextRequest, ctx: Ctx) => {
    try {
      if (req.method !== "GET") assertSameOrigin(req);
      let user: SessionUser | undefined;
      if (opts.auth) {
        user = (await getCurrentUser()) ?? undefined;
        if (!user) throw ApiError.unauthorized();
      }
      return ok(await fn(req, { ...ctx, user } as Parameters<typeof fn>[1]));
    } catch (err) {
      return fail(err);
    }
  };
}
