import { ENDPOINTS } from "@/constants";
import { api } from "@/lib/api/client";
import type { CreateExpense, Expense, UpdateExpense } from "@/types/expense";

export const expenseService = {
  /** Newest first. */
  list: () => api.get<never, Expense[]>(ENDPOINTS.EXPENSES),
  create: (body: CreateExpense) => api.post<never, Expense>(ENDPOINTS.EXPENSES, body),
  update: (id: string, body: UpdateExpense) => api.patch<never, Expense>(ENDPOINTS.EXPENSE(id), body),
  remove: (id: string) => api.delete<never, { id: string }>(ENDPOINTS.EXPENSE(id)),
};
