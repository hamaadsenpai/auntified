"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Button, Input, Money, Select, type SelectVariant } from "@/components/ui";
import { LIMITS, SALARY_SGD } from "@/constants";
import type { Currency } from "@/constants/currencies";
import { useCreditsStore, useCurrency, useSettingsStore } from "@/store";
import type { CreateCredit } from "@/types/credit";
import type { UpdateSettings } from "@/types/settings";
import { accountsOf, MAIN_ACCOUNT_ID } from "@/utils/accounts";
import { errorMessage } from "@/utils";
import { convertFromSgd } from "@/utils/format";

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
  const sgd = amount / currency.rate;
  return sgd > LIMITS.MAX_AMOUNT_SGD ? null : sgd;
}

/** Pre-fills an amount input with a stored SGD value in the user's currency. */
function fromSgd(sgd: number, currency: Currency) {
  return String(convertFromSgd(sgd, currency));
}

/** Saves through the settings store (or runs any other action); a failure shows as a toast. */
function useSettingsForm(onClose: () => void) {
  const [pending, setPending] = useState(false);

  async function run(action: () => Promise<unknown>) {
    setPending(true);
    try {
      await action();
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
      setPending(false);
    }
  }

  const submit = (body: UpdateSettings) => run(() => useSettingsStore.getState().save(body));
  return { pending, submit, run };
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
  submitLabel = "Save",
  children,
}: {
  onSubmit: () => void;
  onClose: () => void;
  pending: boolean;
  submitLabel?: string;
  children: ReactNode;
}) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[12px] py-[12px]">
      {children}
      <div className="flex gap-[12px]">
        <Button variant="secondary" className="flex-1" disabled={pending} onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 disabled:opacity-60" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function AccountNameForm({ variant, onClose }: FormProps) {
  const id = useId();
  const [name, setName] = useState(() => useSettingsStore.getState().settings.accountName);
  const { pending, submit } = useSettingsForm(onClose);

  return (
    <FormShell onSubmit={() => void submit({ accountName: name.trim() })} onClose={onClose} pending={pending}>
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
  const { pending, submit } = useSettingsForm(onClose);

  function save() {
    const balanceSgd = toSgd(balance, currency);
    if (balanceSgd === null) toast.error("Enter a balance of 0 or more.");
    else void submit({ balanceSgd });
  }

  return (
    <FormShell onSubmit={save} onClose={onClose} pending={pending}>
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

/** Opens an extra account with a name and an opening balance. */
export function AddAccountForm({ variant, onClose }: FormProps) {
  const id = useId();
  const currency = useCurrency();
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("0");
  const { pending, submit } = useSettingsForm(onClose);

  function save() {
    const balanceSgd = toSgd(balance, currency);
    if (!name.trim()) return toast.error("Enter a name for the account.");
    if (balanceSgd === null) return toast.error("Enter a balance of 0 or more.");
    void submit({ addAccount: { name: name.trim(), balanceSgd } });
  }

  return (
    <FormShell onSubmit={save} onClose={onClose} pending={pending} submitLabel="Add account">
      <Field id={id} label="Account name">
        <Input id={id} variant={variant} required maxLength={LIMITS.NAME} placeholder="e.g. Savings" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field id={`${id}-balance`} label={`Opening balance (${currency.code})`}>
        <Input
          id={`${id}-balance`}
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

/** Credits a demo account: a typed top-up, or one simulated salary. */
export function AddMoneyForm({ variant, onClose }: FormProps) {
  const id = useId();
  const currency = useCurrency();
  const accounts = accountsOf(useSettingsStore((s) => s.settings));
  const [accountId, setAccountId] = useState(MAIN_ACCOUNT_ID);
  const [amount, setAmount] = useState("");
  const { pending, run } = useSettingsForm(onClose);
  const step = currency.decimals ? 0.01 : 1;
  const credit = (body: Omit<CreateCredit, "accountId">) => void run(() => useCreditsStore.getState().create({ ...body, accountId }));

  function topUp() {
    const amountSgd = toSgd(amount, currency, { positive: true });
    if (amountSgd === null) toast.error("Enter an amount above 0.");
    else credit({ kind: "topup", amountSgd });
  }

  return (
    <FormShell onSubmit={topUp} onClose={onClose} pending={pending} submitLabel="Top up">
      {accounts.length > 1 && (
        <Field id={`${id}-account`} label="Into">
          <Select id={`${id}-account`} variant={variant} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field id={id} label={`Amount (${currency.code})`}>
        <Input
          id={id}
          variant={variant}
          type="number"
          inputMode="decimal"
          required
          min={step}
          step={step}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>
      <Button variant="secondary" disabled={pending} onClick={() => credit({ kind: "salary", amountSgd: SALARY_SGD })} className="disabled:opacity-60">
        Pay salary (<Money sgd={SALARY_SGD} whole />)
      </Button>
    </FormShell>
  );
}

export function TrustedContactForm({ variant, onClose }: FormProps) {
  const id = useId();
  const [values, setValues] = useState(() => useSettingsStore.getState().settings.trustedContact ?? { name: "", relation: "", phone: "" });
  const { pending, submit } = useSettingsForm(onClose);
  const fields = [
    { key: "name", label: "Name", placeholder: "e.g. Tan Mei Lin", maxLength: LIMITS.NAME, required: true, type: "text" },
    { key: "relation", label: "Who they are", placeholder: "e.g. Sister", maxLength: LIMITS.NOTE, required: false, type: "text" },
    { key: "phone", label: "Phone", placeholder: "e.g. 9123 4567", maxLength: 30, required: true, type: "tel" },
  ] as const;

  function save() {
    void submit({ trustedContact: { name: values.name.trim(), relation: values.relation.trim(), phone: values.phone.trim() } });
  }

  return (
    <FormShell onSubmit={save} onClose={onClose} pending={pending}>
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

/** Money Lock: how much of the main account can't be sent by transfer. */
export function MoneyLockForm({ variant, onClose }: FormProps) {
  const id = useId();
  const currency = useCurrency();
  const accountName = useSettingsStore((s) => s.settings.accountName);
  const [amount, setAmount] = useState(() => fromSgd(useSettingsStore.getState().settings.lockedSgd, currency));
  const { pending, submit } = useSettingsForm(onClose);

  function save() {
    const lockedSgd = toSgd(amount, currency);
    if (lockedSgd === null) toast.error("Enter an amount of 0 or more.");
    else void submit({ lockedSgd });
  }

  return (
    <FormShell onSubmit={save} onClose={onClose} pending={pending} submitLabel="Lock">
      <Field id={id} label={`Amount to lock in ${accountName} (${currency.code})`}>
        <Input
          id={id}
          variant={variant}
          type="number"
          inputMode="decimal"
          required
          min={0}
          step={currency.decimals ? 0.01 : 1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>
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
  const { pending, submit } = useSettingsForm(onClose);
  const step = currency.decimals ? 0.01 : 1;

  function save() {
    const targetSgd = toSgd(values.target, currency, { positive: true });
    const savedSgd = toSgd(values.saved, currency);
    if (targetSgd === null) toast.error("Enter a target above 0.");
    else if (savedSgd === null) toast.error("Enter how much you've saved, 0 or more.");
    else if (!values.deadline) toast.error("Pick a date for the goal.");
    else void submit({ savingsGoal: { targetSgd, savedSgd, deadline: values.deadline } });
  }

  return (
    <FormShell onSubmit={save} onClose={onClose} pending={pending}>
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
