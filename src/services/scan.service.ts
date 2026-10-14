import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { ScanRequest, ScanResult } from "@/types/scan";

export const scanService = {
  scan: (body: ScanRequest) => api.post<never, ScanResult>(ENDPOINTS.SCAN, body),
};
