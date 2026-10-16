import { withHandler } from "@/lib/api/handler";
import { createSmsKey, getSmsKeyStatus, revokeSmsKey } from "@/server/repositories/sms-keys.repository";

/** Whether the signed-in user has an SMS import key, and when it was last used. */
export const GET = withHandler(async (_req, { user }) => getSmsKeyStatus(user.uid), { auth: true });

/** A new key, returned once. Replaces any older key. */
export const POST = withHandler(async (_req, { user }) => createSmsKey(user.uid), { auth: true });

export const DELETE = withHandler(async (_req, { user }) => revokeSmsKey(user.uid), { auth: true });