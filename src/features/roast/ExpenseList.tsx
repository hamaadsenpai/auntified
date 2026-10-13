"use client";

import { useState } from "react";
import { Money } from "@/components/ui";
import { useExpensesStore } from "@/store";
import type { ApiFailure } from "@/types/api";
import type { Expense } from "@/types/expense";
import { cn } from "@/utils";
import { ExpenseForm } from "./ExpenseForm";
import { useRoast } from "./useRoast";
import { formatDay } from "./week";

const LINK = "min-h-[44px] cursor-pointer border-none bg-transparent p-0 text-[14px] font-semibold text-teal disabled:opacity-60";

/** Add, edit and delete spending. Shows this week by default, with a toggle for everything older. */
export function ExpenseList({ className }: { className?: string }) {
  const { status, error, ready, expenses, week } = useRoast();
  const [adding, setAdding] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? expenses : week;
  const older = expenses.length - week.length;

  return (
    <section className={cn("flex flex-col gap-[12px]", className)}>
      <div className="flex items-baseline justify-between gap-[12px]">
        <h2 className="m-0 font-display text-[18px] font-bold">{showAll ? "All spending" : "Spent this week"}</h2>
        {!adding && (
          <button type="button" className={LINK} onClick={() => setAdding(true)}>
            Add spending
          </button>
        )}
      </div>
      {adding && (
        <div className="rounded-[18px] bg-wash p-[16px]">
          <ExpenseForm
            submitLabel="Add spending"
            onSubmit={async (body) => {
              await useExpensesStore.getState().create(body);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}
      {status === "error" ? (
        <div className="flex flex-col items-start gap-[4px]">
          <p role="alert" className="m-0 text-[14px] font-semibold text-brick">
            {error}
          </p>
          <button type="button" className={LINK} onClick={() => void useExpensesStore.getState().load(true)}>
            Try again
          </button>
        </div>
      ) : !ready ? (
        <p className="m-0 text-[14px] font-medium text-muted">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="m-0 text-[14px] font-medium text-muted">
          {expenses.length === 0 ? "Nothing logged yet. Tap Add spending to log your first one." : "Nothing logged this week. Tap Add spending to log one."}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col border-t border-line p-0">
          {shown.map((e) => (
            <ExpenseRow key={e.id} expense={e} />
          ))}
        </ul>
      )}
      {ready && (older > 0 || showAll) && (
        <button type="button" className={cn(LINK, "self-start")} onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Show this week only" : `Show older spending (${older})`}
        </button>
      )}
    </section>
  );
}

function ExpenseRow({ expense }: { expense: Expense }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(`Delete "${expense.name}"?`)) return;
    setDeleting(true);
    setError(null);
    try {
      await useExpensesStore.getState().remove(expense.id);
    } catch (err) {
      setError((err as ApiFailure["error"])?.message ?? "Something went wrong. Try again.");
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <li className="border-b border-line py-[14px]">
        <ExpenseForm
          initial={expense}
          submitLabel="Save"
          onSubmit={async (body) => {
            await useExpensesStore.getState().update(expense.id, body);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-[12px] gap-y-[2px] border-b border-line py-[10px]">
      <span className="text-[16px] font-semibold">{expense.name}</span>
      <span className="font-display text-[17px] font-bold">
        <Money sgd={expense.amountSgd} />
      </span>
      <span className="text-[13px] font-medium text-muted">
        {expense.category} · {formatDay(new Date(expense.spentAt))}
      </span>
      <span className="flex gap-[16px]">
        <button type="button" className={LINK} disabled={deleting} onClick={() => setEditing(true)}>
          Edit
        </button>
        <button type="button" className={cn(LINK, "text-brick")} disabled={deleting} onClick={handleDelete}>
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </span>
      {error && (
        <p role="alert" className="col-span-full m-0 text-[13px] font-semibold text-brick">
          {error}
        </p>
      )}
    </li>
  );
}
