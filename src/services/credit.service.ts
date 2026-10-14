import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { CreateCredit, Credit } from "@/types/credit";

export const creditService = {
  /** Newest first. */
  list: () => api.get<never, Credit[]>(ENDPOINTS.CREDITS),
  create: (body: CreateCredit) => api.post<never, Credit>(ENDPOINTS.CREDITS, body),
};
