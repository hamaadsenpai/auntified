import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { AskRequest, AskResult } from "@/types/ask";

export const askService = {
  send: (body: AskRequest) => api.post<never, AskResult>(ENDPOINTS.ASK, body),
};
