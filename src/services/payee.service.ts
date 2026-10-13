import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { CreatePayee, Payee, UpdatePayee } from "@/types/payee";

export const payeeService = {
  list: () => api.get<never, Payee[]>(ENDPOINTS.PAYEES),
  get: (id: string) => api.get<never, Payee>(ENDPOINTS.PAYEE(id)),
  create: (body: CreatePayee) => api.post<never, Payee>(ENDPOINTS.PAYEES, body),
  update: (id: string, body: UpdatePayee) => api.patch<never, Payee>(ENDPOINTS.PAYEE(id), body),
  remove: (id: string) => api.delete<never, { id: string }>(ENDPOINTS.PAYEE(id)),
};
