import { z } from "zod";
import { DEMO_JUMPS } from "@/constants/demo";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { publicEnv } from "@/lib/env.client";
import { fireScam, getDemoState, jumpClock, resetDemo, seedDemo } from "@/server/repositories/demo.repository";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("seed") }).strict(),
  z.object({ action: z.literal("fire") }).strict(),
  z.object({ action: z.literal("jump"), hours: z.number().refine((h) => DEMO_JUMPS.some((j) => j.hours === h)) }).strict(),
  z.object({ action: z.literal("reset") }).strict(),
]);

/** Demo controls exist only in dev and on demo deployments; anywhere else they 404. */
function assertDemoMode() {
  if (!publicEnv.DEMO_MODE) throw ApiError.notFound();
}

/** How far the signed-in user's demo clock has been jumped. */
export const GET = withHandler(
  async (_req, { user }) => {
    assertDemoMode();
    return getDemoState(user.uid);
  },
  { auth: true },
);

/** Seeds, fires a scam payment, jumps the clock or resets the signed-in user's own data. */
export const POST = withHandler(
  async (req, { user }) => {
    assertDemoMode();
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid demo action.");
    const body = parsed.data;
    if (body.action === "seed") return seedDemo(user.uid);
    if (body.action === "fire") return fireScam(user.uid);
    if (body.action === "jump") return jumpClock(user.uid, body.hours);
    return resetDemo(user.uid);
  },
  { auth: true },
);
