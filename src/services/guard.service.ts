import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { GuardToken } from "@/types/guard";

export const guardService = {
  token: () => api.post<never, GuardToken>(ENDPOINTS.GUARD_TOKEN),
};
