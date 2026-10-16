import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { SpeakRequest, SpeakResult } from "@/types/speak";

export const speakService = {
  speak: (body: SpeakRequest) => api.post<never, SpeakResult>(ENDPOINTS.SPEAK, body),
};
