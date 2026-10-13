import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { AccountSettings, UpdateSettings } from "@/types/settings";

export const settingsService = {
  get: () => api.get<never, AccountSettings>(ENDPOINTS.SETTINGS),
  update: (body: UpdateSettings) => api.patch<never, AccountSettings>(ENDPOINTS.SETTINGS, body),
};
