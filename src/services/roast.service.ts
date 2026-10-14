import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { RoastRequest, RoastResult } from "@/types/roast";

export const roastService = {
  get: (body: RoastRequest) => api.post<never, RoastResult>(ENDPOINTS.ROAST, body),
};
