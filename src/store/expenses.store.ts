import { expenseService } from "@/services/expense.service";
import type { CreateExpense, Expense, UpdateExpense } from "@/types/expense";
import { collection, type CollectionState } from "./collection";
import { createStore } from "./create-store";

export const useExpensesStore = createStore<CollectionState<Expense, CreateExpense, UpdateExpense>>(
  "expenses",
  collection(expenseService),
);
