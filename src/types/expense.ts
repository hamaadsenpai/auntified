/** `users/{uid}/expenses/{id}`: everyday spending the weekly roast and patterns are built from. */
export type Expense = {
  id: string;
  name: string;
  category: string;
  amountSgd: number;
  /** When the money was spent (ISO). */
  spentAt: string;
  createdAt: string;
  /** A bill or subscription that comes back regularly, as found in an imported statement. */
  recurring?: boolean;
};

/** Body of POST /api/expenses. `spentAt` defaults to now. */
export type CreateExpense = { name: string; category: string; amountSgd: number; spentAt?: string };

/** Body of PATCH /api/expenses/[id]. */
export type UpdateExpense = Partial<CreateExpense>;

/** Body of POST /api/statements: a PDF or CSV bank statement, base64 without the data: prefix. */
export type StatementUpload = { mimeType: "application/pdf" | "text/csv"; data: string };

/** Response of POST /api/statements. `recurring` names the bills and subscriptions found. */
export type StatementImport = { added: number; skipped: number; recurring: string[] };
