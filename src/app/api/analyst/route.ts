import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { publicEnv } from "@/lib/env.client";
import { env } from "@/lib/env.server";
import { listFlagged, reviewTransfer } from "@/server/repositories/transfers.repository";
import type { SessionUser } from "@/types/auth";

const schema = z
  .object({
    uid: z.string().min(1).max(128),
    transferId: z.string().min(1).max(128),
    action: z.enum(["approve", "hold", "report"]),
  })
  .strict();

/** Admins (ADMIN_EMAILS) and, on demo deployments, every account. Anyone else gets a 404. */
function assertAnalyst(user: SessionUser) {
  if (publicEnv.DEMO_MODE || (user.email && env.ADMIN_EMAILS.includes(user.email.toLowerCase()))) return;
  throw ApiError.notFound();
}

/** Every user's warned and blocked transfers, riskiest first. */
export const GET = withHandler(
  async (_req, { user }) => {
    assertAnalyst(user);
    return listFlagged();
  },
  { auth: true },
);

/** Approves, holds or reports one flagged transfer. */
export const POST = withHandler(
  async (req, { user }) => {
    assertAnalyst(user);
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw ApiError.badRequest("Invalid review.");
    const { uid, transferId, action } = parsed.data;
    return reviewTransfer(uid, transferId, action);
  },
  { auth: true },
);
