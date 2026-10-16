import { withHandler } from "@/lib/api/handler";
import { listSmsScans } from "@/server/repositories/sms-scans.repository";

/** The texts the iPhone Shortcut forwarded and Auntie checked, newest first. */
export const GET = withHandler(async (_req, { user }) => listSmsScans(user.uid), { auth: true });
