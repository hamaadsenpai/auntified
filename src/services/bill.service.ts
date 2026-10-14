import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { Bill, CreateBill, UpdateBill } from "@/types/bill";

export const billService = {
  /** Newest first. */
  list: () => api.get<never, Bill[]>(ENDPOINTS.BILLS),
  create: (body: CreateBill) => api.post<never, Bill>(ENDPOINTS.BILLS, body),
  update: (id: string, body: UpdateBill) => api.patch<never, Bill>(ENDPOINTS.BILL(id), body),
  remove: (id: string) => api.delete<never, { id: string }>(ENDPOINTS.BILL(id)),
};
