"use client";

import { useId, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Button, Input, Select } from "@/components/ui";
import { EXPENSE_CATEGORIES, LIMITS } from "@/constants";
import { useCurrency } from "@/store";
import type { CreateExpense, Expense } from "@/types/expense";
import { errorMessage } from "@/utils";
import { convertFromSgd } from "@/utils/format";
import { fromDateInput, toDateInput } from "./week";

type ExpenseFormProps = {
  /** The expense being edited; omit to add a new one. */
  initial?: Expense;
  submitLabel: string;
  /** Saves the expense. Throw ApiFailure["error"] to show its message. */
  onSubmit: (body: CreateExpense) => Promise<void>;
  onCancel?: () => void;
};

/** Name, category, amount (in the user's currency) and date of one expense. Used to add and to edit on the weekly roast. */
export function ExpenseForm({ initial, submitLabel, onSubmit, onCancel }: ExpenseFormProps) {
  const id = useId();
  const currency = useCurrency();
  const initialAmount = initial ? String(convertFromSgd(initial.amountSgd, currency)) : "";
  const [today] = useState(() => toDateInput(new Date()));
  const [values, setValues] = useState({
    name: initial?.name ?? "",
    category: initial?.category ?? EXPENSE_CATEGORIES[0],
    amount: initialAmount,
    date: initial ? toDateInput(new Date(initial.spentAt)) : today,
  });
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const amount = Number(values.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter an amount more than zero.");
      return;
    }
    // Untouched fields keep their stored value, so editing the name doesn't round the amount or move the time.
    const amountSgd = initial && values.amount === initialAmount ? initial.amountSgd : amount / currency.rate;
    const original = initial ? new Date(initial.spentAt) : new Date();
    const spentAt = initial && values.date === toDateInput(original) ? original : fromDateInput(values.date, original);
    setPending(true);
    try {
      await onSubmit({ name: values.name.trim(), category: values.category, amountSgd, spentAt: spentAt.toISOString() });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
      <div className="flex flex-col gap-[8px]">
        <label htmlFor={`${id}-name`} className="text-[14px] font-semibold">
          What was it
        </label>
        <Input
          id={`${id}-name`}
          variant="soft"
          placeholder="e.g. Bubble tea"
          maxLength={LIMITS.NAME}
          required
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-[8px]">
        <label htmlFor={`${id}-category`} className="text-[14px] font-semibold">
          Category
        </label>
        <Select
          id={`${id}-category`}
          variant="soft"
          value={values.category}
          onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-[12px]">
        <div className="flex min-w-0 flex-col gap-[8px]">
          <label htmlFor={`${id}-amount`} className="text-[14px] font-semibold">
            Amount ({currency.code})
          </label>
          <Input
            id={`${id}-amount`}
            variant="soft"
            type="number"
            inputMode="decimal"
            min={0}
            step={currency.decimals ? "0.01" : "1"}
            placeholder="0"
            required
            value={values.amount}
            onChange={(e) => setValues((v) => ({ ...v, amount: e.target.value }))}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-[8px]">
          <label htmlFor={`${id}-date`} className="text-[14px] font-semibold">
            Date
          </label>
          <Input
            id={`${id}-date`}
            variant="soft"
            type="date"
            max={today}
            required
            value={values.date}
            onChange={(e) => setValues((v) => ({ ...v, date: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex gap-[12px]">
        {onCancel && (
          <Button variant="secondary" className="flex-1" disabled={pending} onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1 disabled:opacity-60" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
