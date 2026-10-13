import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { CheckRequest, CheckResult } from "@/types/check";

export const checkService = {
  next: (body: CheckRequest) => api.post<never, CheckResult>(ENDPOINTS.PAY_CHECK, body),
};
