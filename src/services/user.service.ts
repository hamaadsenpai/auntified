import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { Preferences, UpdatePreferences } from "@/types/user";

export const userService = {
  updatePreferences: (body: UpdatePreferences) => api.patch<never, Preferences>(ENDPOINTS.PREFERENCES, body),
};
