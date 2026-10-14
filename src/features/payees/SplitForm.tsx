"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Button, Input, Money, Select } from "@/components/ui";
import { LIMITS } from "@/constants";
import { useCurrency } from "@/store";
import type { CreateBill, Party } from "@/types/bill";
import type { Payee } from "@/types/payee";
import { errorMessage } from "@/utils";
import { splitEqually } from "./balances";

type SplitFormProps = {
  payees: Payee[];
  /** Saves the bill. Throw ApiFailure["error"] to show its message. */
  onSubmit: (body: CreateBill) => Promise<void>;
  onCancel?: () => void;
  /** Prefixes the field ids, so two forms can share a page (mobile and desktop). */
  idPrefix?: string;
};

/** A shared bill split equally between the people ticked. The payer is always in. */
export function SplitForm({ payees, onSubmit, onCancel, idPrefix = "split" }: SplitFormProps) {
  const currency = useCurrency();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<Party>("me");
  const [picked, setPicked] = useState<Party[]>(["me"]);
  const [pending, setPending] = useState(false);

  const people = [{ id: "me", name: "You" }, ...payees];
  // Payer first, so they absorb the leftover cents.
  const participants = [paidBy, ...people.map((p) => p.id).filter((id) => id !== paidBy && picked.includes(id))];
  // Typed in the user's currency, like the pay amount; bills are stored in SGD to the cent.
  const totalSgd = Math.round((Number(amount) / currency.rate) * 100) / 100;
  const parts = totalSgd > 0 && participants.length >= 2 ? splitEqually(totalSgd, participants.length) : [];

  const toggle = (id: Party) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (participants.length < 2) return toast.error("Pick at least two people.");
    if (!(totalSgd > 0)) return toast.error("Enter a total more than zero.");
    if (parts.includes(0)) return toast.error("That total is too small to split.");
    setPending(true);
    try {
      const shares = participants.slice(1).map((who, i) => ({ who, amountSgd: parts[i + 1]! }));
      await onSubmit({ kind: "split", title: title.trim(), totalSgd, paidBy, shares });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[8px]">
        <label htmlFor={`${idPrefix}-title`} className="text-[14px] font-semibold">
          What for
        </label>
        <Input
          id={`${idPrefix}-title`}
          variant="soft"
          placeholder="e.g. Dinner at Lau Pa Sat"
          maxLength={LIMITS.REFERENCE}
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-[8px]">
        <label htmlFor={`${idPrefix}-total`} className="text-[14px] font-semibold">
          Total ({currency.symbol.trim()})
        </label>
        <Input
          id={`${idPrefix}-total`}
          type="number"
          inputMode="decimal"
          variant="soft"
          min={0}
          step={currency.decimals === 0 ? 1 : 0.01}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-[8px]">
        <label htmlFor={`${idPrefix}-paid`} className="text-[14px] font-semibold">
          Who paid
        </label>
        <Select id={`${idPrefix}-paid`} variant="soft" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>
      <fieldset className="m-0 flex flex-col gap-[8px] border-none p-0">
        <legend className="mb-[8px] p-0 text-[14px] font-semibold">Split between</legend>
        {people.map((p) => (
          <label key={p.id} className="flex min-h-[44px] cursor-pointer items-center gap-[10px] text-[15px] font-medium">
            <input
              type="checkbox"
              className="h-[20px] w-[20px] accent-teal"
              checked={participants.includes(p.id)}
              disabled={p.id === paidBy}
              onChange={() => toggle(p.id)}
            />
            {p.name}
            {p.id === paidBy && <span className="text-muted">(paid)</span>}
          </label>
        ))}
      </fieldset>
      {parts.length > 0 && (
        <p className="m-0 text-[14px] font-medium text-muted">
          Split equally: {participants.length} people, about <Money sgd={parts[parts.length - 1]!} /> each.
        </p>
      )}
      <div className="flex gap-[12px]">
        {onCancel && (
          <Button variant="secondary" className="flex-1" disabled={pending} onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1 disabled:opacity-60" disabled={pending}>
          {pending ? "Saving…" : "Split bill"}
        </Button>
      </div>
    </form>
  );
}
