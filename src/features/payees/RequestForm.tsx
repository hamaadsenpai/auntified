"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Button, Input } from "@/components/ui";
import { LIMITS } from "@/constants";
import { useBillsStore, useCurrency } from "@/store";
import { errorMessage } from "@/utils";
import { formatCurrency } from "@/utils/format";

type RequestFormProps = {
  payeeId: string;
  name: string;
  onDone: () => void;
  /** Prefixes the field ids, so two forms can share a page (mobile and desktop). */
  idPrefix?: string;
};

/** Records a money request from one payee, then hands the message to the share sheet or clipboard. No money moves. */
export function RequestForm({ payeeId, name, onDone, idPrefix = "request" }: RequestFormProps) {
  const currency = useCurrency();
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Typed in the user's currency, like the pay amount; bills are stored in SGD to the cent.
    const amountSgd = Math.round((Number(amount) / currency.rate) * 100) / 100;
    const what = title.trim();
    if (!(amountSgd > 0)) return toast.error("Enter an amount more than zero.");
    if (!what) return toast.error("Say what the money is for.");
    setPending(true);
    try {
      await useBillsStore.getState().create({ kind: "request", title: what, totalSgd: amountSgd, paidBy: "me", shares: [{ who: payeeId, amountSgd }] });
      setText(`Hi ${name}, could you send me ${formatCurrency(Number(amount), currency)} for ${what}? Thanks!`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  async function send() {
    if (!text) return;
    if (navigator.share) {
      try {
        return await navigator.share({ text });
      } catch (err) {
        if ((err as Error).name === "AbortError") return; // closed the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      toast.error("Could not copy the message. Try again.");
    }
  }

  if (text) {
    return (
      <div className="flex flex-col gap-[16px]">
        <p className="m-0 rounded-[14px] border border-line-strong px-[14px] py-[12px] text-[15px] font-medium">{text}</p>
        <div className="flex gap-[12px]">
          <Button variant="secondary" className="flex-1" onClick={onDone}>
            Done
          </Button>
          <Button className="flex-1" onClick={() => void send()}>
            {copied ? "Copied" : "Send request"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[8px]">
        <label htmlFor={`${idPrefix}-amount`} className="text-[14px] font-semibold">
          Amount ({currency.symbol.trim()})
        </label>
        <Input
          id={`${idPrefix}-amount`}
          name="amount"
          type="number"
          inputMode="decimal"
          variant="soft"
          placeholder="e.g. 25.00"
          step={currency.decimals === 0 ? 1 : 0.01}
          min={0}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-[8px]">
        <label htmlFor={`${idPrefix}-title`} className="text-[14px] font-semibold">
          What for
        </label>
        <Input
          id={`${idPrefix}-title`}
          name="title"
          variant="soft"
          placeholder="e.g. Concert tickets"
          maxLength={LIMITS.REFERENCE}
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="flex gap-[12px]">
        <Button variant="secondary" className="flex-1" disabled={pending} onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 disabled:opacity-60" disabled={pending}>
          {pending ? "Saving…" : "Request money"}
        </Button>
      </div>
    </form>
  );
}
