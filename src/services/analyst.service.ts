import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { FlaggedTransfer, ReviewRequest } from "@/types/analyst";
import type { Transfer } from "@/types/transfer";

export const analystService = {
  list: () => api.get<never, FlaggedTransfer[]>(ENDPOINTS.ANALYST),
  review: (body: ReviewRequest) => api.post<never, Transfer>(ENDPOINTS.ANALYST, body),
};
