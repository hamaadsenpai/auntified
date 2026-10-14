"use client";

import { useState, type FormEvent } from "react";
import { Button, Input } from "@/components/ui";
import { LIMITS } from "@/constants";
import type { ApiFailure } from "@/types/api";

type PayeeBody = { name: string; account: string; note: string };

type PayeeFormProps = {
  initial?: PayeeBody;
  submitLabel: string;
  /** Saves the payee. Throw ApiFailure["error"] to show its message. */
  onSubmit: (body: PayeeBody) => Promise<void>;
  onCancel?: () => void;
  /** Prefixes the field ids, so two forms can share a page (mobile and desktop). */
  idPrefix?: string;
};

const FIELDS = [
  { key: "name", label: "Name", placeholder: "e.g. Tan Mei Ling", maxLength: LIMITS.NAME, required: true },
  { key: "account", label: "Account", placeholder: "e.g. PayNow 9123 8821", maxLength: LIMITS.ACCOUNT, required: true },
  { key: "note", label: "Who they are", placeholder: "e.g. Mum", maxLength: LIMITS.NOTE, required: false },
] as const;

/** Name, account and note for a payee. Used to add one on Pay and to edit one on the payee screen. */
export function PayeeForm({ initial, submitLabel, onSubmit, onCancel, idPrefix = "payee" }: PayeeFormProps) {
  const [values, setValues] = useState<PayeeBody>(initial ?? { name: "", account: "", note: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await onSubmit({ name: values.name.trim(), account: values.account.trim(), note: values.note.trim() });
    } catch (err) {
      setError((err as ApiFailure["error"])?.message ?? "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
      {FIELDS.map((f) => (
        <div key={f.key} className="flex flex-col gap-[8px]">
          <label htmlFor={`${idPrefix}-${f.key}`} className="text-[14px] font-semibold">
            {f.label}
            {!f.required && <span className="font-medium text-muted"> (optional)</span>}
          </label>
          <Input
            id={`${idPrefix}-${f.key}`}
            name={f.key}
            variant="soft"
            placeholder={f.placeholder}
            maxLength={f.maxLength}
            required={f.required}
            value={values[f.key]}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
          />
        </div>
      ))}
      {error && (
        <p role="alert" className="m-0 rounded-[14px] border-[1.5px] border-brick px-[14px] py-[10px] text-[14px] font-semibold text-brick">
          {error}
        </p>
      )}
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
