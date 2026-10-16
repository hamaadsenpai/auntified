import { ApiError } from "@/lib/api/errors";
import { withHandler } from "@/lib/api/handler";
import { deleteSmsScan } from "@/server/repositories/sms-scans.repository";

export const DELETE = withHandler(
  async (_req, { user, params }) => {
    const { id } = await params;
    if (!(await deleteSmsScan(user.uid, id))) throw ApiError.notFound("Scan not found.");
    return { id };
  },
  { auth: true },
);
