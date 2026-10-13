import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { CreateTransfer, Transfer, UpdateTransfer } from "@/types/transfer";

export const transferService = {
  /** Newest first. */
  list: () => api.get<never, Transfer[]>(ENDPOINTS.TRANSFERS),
  get: (id: string) => api.get<never, Transfer>(ENDPOINTS.TRANSFER(id)),
  create: (body: CreateTransfer) => api.post<never, Transfer>(ENDPOINTS.TRANSFERS, body),
  update: (id: string, body: UpdateTransfer) => api.patch<never, Transfer>(ENDPOINTS.TRANSFER(id), body),
  remove: (id: string) => api.delete<never, { id: string }>(ENDPOINTS.TRANSFER(id)),
};
