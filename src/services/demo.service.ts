import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { DemoAction, DemoState } from "@/types/demo";

export const demoService = {
  get: () => api.get<never, DemoState>(ENDPOINTS.DEMO),
  run: (body: DemoAction) => api.post<never, DemoState>(ENDPOINTS.DEMO, body),
};
