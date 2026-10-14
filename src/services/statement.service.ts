import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { StatementImport, StatementUpload } from "@/types/expense";

export const statementService = {
  upload: (body: StatementUpload) => api.post<never, StatementImport>(ENDPOINTS.STATEMENTS, body),
};
