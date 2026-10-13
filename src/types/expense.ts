/** `users/{uid}/expenses/{id}`: everyday spending the weekly roast and patterns are built from. */
export type Expense = {
  id: string;
  name: string;
  category: string;
  amountSgd: number;
  /** When the money was spent (ISO). */
  spentAt: string;
  createdAt: string;
};

/** Body of POST /api/expenses. `spentAt` defaults to now. */
export type CreateExpense = { name: string; category: string; amountSgd: number; spentAt?: string };

/** Body of PATCH /api/expenses/[id]. */
export type UpdateExpense = Partial<CreateExpense>;
