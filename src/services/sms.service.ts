import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { CreatedSmsKey, SmsKeyStatus, SmsScan } from "@/types/sms";

export const smsService = {
  status: () => api.get<never, SmsKeyStatus>(ENDPOINTS.SMS_KEY),
  createKey: () => api.post<never, CreatedSmsKey>(ENDPOINTS.SMS_KEY),
  revokeKey: () => api.delete<never, SmsKeyStatus>(ENDPOINTS.SMS_KEY),
  scans: () => api.get<never, SmsScan[]>(ENDPOINTS.SMS_SCANS),
  removeScan: (id: string) => api.delete<never, { id: string }>(ENDPOINTS.SMS_SCAN(id)),
};
