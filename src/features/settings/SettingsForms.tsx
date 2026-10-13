"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Button, Input, type SelectVariant } from "@/components/ui";
import { LIMITS } from "@/constants";
import type { Currency } from "@/constants/currencies";
import { useCurrency, useSettingsStore } from "@/store";
import type { UpdateSettings } from "@/types/settings";
import { convertFromSgd } from "@/utils/format";
import { errorMessage } from "./SettingsControls";

type FormProps = {
  /** Field look: "bold" on mobile, "soft" on desktop. */
  variant: SelectVariant;
  /** Called after the save succeeds, and on Cancel. */
  onClose: () => void;
};

/** Typed in the user's currency, stored in SGD. Returns null if it isn't a usable amount. */
function toSgd(value: string, currency: Currency, { positive = false } = {}): number | null {
  const amount = Number(value);
  if (value.trim() === "" || !Number.isFinite(amount) || amount < 0 || (positive && amount === 0)) return null;
  const sgd = Math.round((amount / currency.rate) * 100) / 100;
  return sgd > LIMITS.MAX_AMOUNT_SGD ? null : sgd;
}

/** Pre-fills an amount input with a stored SGD value in the user's currency. */
function fromSgd(sgd: number, currency: Currency) {
  return String(convertFromSgd(sgd, currency));
}

/** Saves through the settings store and keeps the error for the form's alert. */
function useSettingsForm(onClose: () => void) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(body: UpdateSettings) {
    setPending(true);
    setError(null);
    try {
      await useSettingsStore.getState().save(body);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  }

  return { pending, error, setError, submit };
}

function Field({ id, label, optional, children }: { id: string; label: string; optional?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <label htmlFor={id} className="text-[14px] font-semibold">
        {label}
        {optional && <span className="font-medium text-muted"> (optional)</span>}
      </label>
      {children}
    </div>
  );
}

function FormShell({
  onSubmit,
  onClose,
  pending,
  error,
  children,
}: {
  onSubmit: () => void;
  onClose: () => void;
  pending: boolean;
  error: string | null;
  children: ReactNode;
}) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[12px] py-[12px]">
      {children}
      {error && (
        <p role="alert" className="m-0 rounded-[14px] border-[1.5px] border-brick px-[14px] py-[10px] text-[14px] font-semibold text-brick">
          {error}
        </p>
      )}
      <div className="flex gap-[12px]">
        <Button variant="secondary" className="flex-1" disabled={pending} onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 disabled:opacity-60" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

export function AccountNameForm({ variant, onClose }: FormProps) {
  const id = useId();
  const [name, setName] = useState(() => useSettingsStore.getState().settings.accountName);
  const { pending, error, submit } = useSettingsForm(onClose);

  return (
    <FormShell onSubmit={() => void submit({ accountName: name.trim() })} onClose={onClose} pending={pending} error={error}>
      <Field id={id} label="Account name">
        <Input id={id} variant={variant} required maxLength={LIMITS.NAME} placeholder="e.g. Everyday Account" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
    </FormShell>
  );
}

export function BalanceForm({ variant, onClose }: FormProps) {
  const id = useId();
  const currency = useCurrency();
  const [balance, setBalance] = useState(() => fromSgd(useSettingsStore.getState().settings.balanceSgd, currency));
  const { pending, error, setError, submit } = useSettingsForm(onClose);

  function save() {
    const balanceSgd = toSgd(balance, currency);
    if (balanceSgd === null) setError("Enter a balance of 0 or more.");
    else void submit({ balanceSgd });
  }

  return (
    <FormShell onSubmit={save} onClose={onClose} pending={pending} error={error}>
      <Field id={id} label={`Balance (${currency.code})`}>
        <Input
          id={id}
          variant={variant}
          type="number"
          inputMode="decimal"
          required
          min={0}
          step={currency.decimals ? 0.01 : 1}
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />
      </Field>
    </FormShell>
  );
}

export function TrustedContactForm({ variant, onClose }: FormProps) {
  const id = useId();
  const [values, setValues] = useState(() => useSettingsStore.getState().settings.trustedContact ?? { name: "", relation: "", phone: "" });
  const { pending, error, submit } = useSettingsForm(onClose);
  const fields = [
    { key: "name", label: "Name", placeholder: "e.g. Tan Mei Lin", maxLength: LIMITS.NAME, required: true, type: "text" },
    { key: "relation", label: "Who they are", placeholder: "e.g. Sister", maxLength: LIMITS.NOTE, required: false, type: "text" },
    { key: "phone", label: "Phone", placeholder: "e.g. 9123 4567", maxLength: 30, required: true, type: "tel" },
  ] as const;

  function save() {
    void submit({ trustedContact: { name: values.name.trim(), relation: values.relation.trim(), phone: values.phone.trim() } });
  }

  return (
    <FormShell onSubmit={save} onClose={onClose} pending={pending} error={error}>
      {fields.map((f) => (
        <Field key={f.key} id={`${id}-${f.key}`} label={f.label} optional={!f.required}>
          <Input
            id={`${id}-${f.key}`}
            variant={variant}
            type={f.type}
            placeholder={f.placeholder}
            maxLength={f.maxLength}
            minLength={f.key === "phone" ? 3 : undefined}
            required={f.required}
            value={values[f.key]}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
          />
        </Field>
      ))}
    </FormShell>
  );
}

export function SavingsGoalForm({ variant, onClose }: FormProps) {
  const id = useId();
  const currency = useCurrency();
  const [values, setValues] = useState(() => {
    const goal = useSettingsStore.getState().settings.savingsGoal;
    return {
      target: goal ? fromSgd(goal.targetSgd, currency) : "",
      saved: goal ? fromSgd(goal.savedSgd, currency) : "0",
      deadline: goal?.deadline ?? "",
    };
  });
  const { pending, error, setError, submit } = useSettingsForm(onClose);
  const step = currency.decimals ? 0.01 : 1;

  function save() {
    const targetSgd = toSgd(values.target, currency, { positive: true });
    const savedSgd = toSgd(values.saved, currency);
    if (targetSgd === null) setError("Enter a target above 0.");
    else if (savedSgd === null) setError("Enter how much you've saved, 0 or more.");
    else if (!values.deadline) setError("Pick a date for the goal.");
    else void submit({ savingsGoal: { targetSgd, savedSgd, deadline: values.deadline } });
  }

  return (
    <FormShell onSubmit={save} onClose={onClose} pending={pending} error={error}>
      <Field id={`${id}-target`} label={`Target (${currency.code})`}>
        <Input
          id={`${id}-target`}
          variant={variant}
          type="number"
          inputMode="decimal"
          required
          min={step}
          step={step}
          value={values.target}
          onChange={(e) => setValues((v) => ({ ...v, target: e.target.value }))}
        />
      </Field>
      <Field id={`${id}-saved`} label={`Already saved (${currency.code})`}>
        <Input
          id={`${id}-saved`}
          variant={variant}
          type="number"
          inputMode="decimal"
          required
          min={0}
          step={step}
          value={values.saved}
          onChange={(e) => setValues((v) => ({ ...v, saved: e.target.value }))}
        />
      </Field>
      <Field id={`${id}-deadline`} label="By">
        <Input
          id={`${id}-deadline`}
          variant={variant}
          type="date"
          required
          value={values.deadline}
          onChange={(e) => setValues((v) => ({ ...v, deadline: e.target.value }))}
        />
      </Field>
    </FormShell>
  );
}
