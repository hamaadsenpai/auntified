"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Screen } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Avatar, Button, Card, FIELD_BASE, FIELD_VARIANTS, Money } from "@/components/ui";
import { LIMITS, ROUTES, withTransfer } from "@/constants";
import { useSettings, useTransfersStore } from "@/store";
import type { ApiFailure } from "@/types/api";
import type { Transfer } from "@/types/transfer";
import { cn } from "@/utils";
import { formatWhen, TransferFallback, useTransferParam } from "./transfer-param";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export function BlockedScreen() {
  const { transfer, missing } = useTransferParam();
  const contact = useSettings().settings.trustedContact;

  if (!transfer) return <TransferFallback missing={missing} />;

  const [headline, ...otherReasons] = transfer.reasons;

  return (
    <Screen>
      <header role="alert" className="flex flex-none flex-col gap-[8px] bg-brick px-[20px] pt-[24px] pb-[22px] text-white">
        <div className="flex items-baseline justify-between gap-[12px]">
          <span className="text-[12px] font-bold tracking-[.08em] uppercase">Payment stopped</span>
          {transfer.score !== null && <span className="text-[13px] font-semibold">Score {transfer.score}/100</span>}
        </div>
        <div className="flex items-center gap-[12px]">
          <h1 className="m-0 flex-1 font-display text-[26px] leading-[1.12] font-bold text-pretty">
            I stopped <Money sgd={transfer.amountSgd} /> to {transfer.payeeName}.
          </h1>
          <span className="flex rounded-[20px] border-[2.5px] border-ink bg-cream p-[4px]">
            <AuntieBao mood="alarm" width={72} height={67} />
          </span>
        </div>
        <p className="m-0 font-display text-[15px] leading-[1.4] font-medium">{headline ?? "That is how scams look."}</p>
      </header>
      <main className="flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto px-[20px] pt-[18px] pb-[20px] *:shrink-0">
        {(transfer.flags.length > 0 || otherReasons.length > 0) && (
          <div className="flex flex-col gap-[6px] rounded-[16px] border-[1.5px] border-brick px-[14px] py-[12px]">
            <span className="text-[12px] font-medium text-muted">What she spotted</span>
            {transfer.flags.length > 0 && (
              <span className="flex flex-wrap gap-[6px]">
                {transfer.flags.map((flag) => (
                  <span key={flag} className="rounded-full bg-brick px-[11px] py-[5px] text-[14px] font-bold text-white">
                    {flag}
                  </span>
                ))}
              </span>
            )}
            {otherReasons.map((reason) => (
              <span key={reason} className="text-[13px] font-medium text-muted">
                {reason}
              </span>
            ))}
          </div>
        )}
        <Card className="flex flex-col gap-[12px] rounded-[22px] px-[16px] py-[14px]">
          {contact ? (
            <>
              <div className="flex items-center gap-[12px]">
                <Avatar initials={initials(contact.name)} size={44} as="div" className="flex-none bg-mint text-[15px]" />
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[12px] font-medium text-muted">Trusted contact</span>
                  <span className="text-[16px] font-semibold">
                    {contact.name}
                    {contact.relation && `, ${contact.relation}`}
                  </span>
                  <span className="text-[13px] font-medium text-muted">{contact.phone}</span>
                </div>
              </div>
              <Button href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>Call {contact.name}</Button>
            </>
          ) : (
            <div className="flex flex-col gap-[2px]">
              <span className="text-[12px] font-medium text-muted">Trusted contact</span>
              <span className="text-[15px] font-medium">
                None yet.{" "}
                <Link href={ROUTES.SETTINGS} className="font-semibold text-teal">
                  Add one in Settings
                </Link>
              </span>
            </div>
          )}
        </Card>
        <Appeal transfer={transfer} />
        <Link
          href={withTransfer(ROUTES.PAY_BLOCKED_WHY, transfer.id)}
          className="flex min-h-[44px] items-center justify-center text-[15px] font-semibold text-teal"
        >
          See how she scored it
        </Link>
        <Link href={ROUTES.HOME} className="flex min-h-[44px] items-center justify-center text-[15px] font-semibold text-teal">
          Back to home
        </Link>
        <p className="m-0 mt-auto text-center text-[12px] leading-[1.4] font-medium text-muted">
          Auntified is an assistant, not a financial adviser.
        </p>
      </main>
    </Screen>
  );
}

/** Records the user's case against the block. The block stays and nothing is sent. */
function Appeal({ transfer }: { transfer: Transfer }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const appealReason = reason.trim();
    if (!appealReason) return setError("Tell Auntie why this payment is safe.");
    setPending(true);
    setError(null);
    try {
      await useTransfersStore.getState().update(transfer.id, { appealReason });
    } catch (err) {
      setError((err as ApiFailure["error"])?.message ?? "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (transfer.appeal) {
    return (
      <Card role="status" className="flex flex-col gap-[6px] rounded-[22px] px-[16px] py-[14px]">
        <span className="text-[12px] font-medium text-muted">Appeal sent {formatWhen(transfer.appeal.at, ", ")}</span>
        <p className="m-0 text-[15px] font-medium break-words">&ldquo;{transfer.appeal.reason}&rdquo;</p>
        <p className="m-0 text-[13px] font-medium text-muted">It&apos;s on record. The payment stays stopped and nothing has been sent.</p>
      </Card>
    );
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Appeal this block
      </Button>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-[10px]">
      <label htmlFor="appeal" className="text-[14px] font-semibold">
        Why is this payment safe?
      </label>
      <textarea
        id="appeal"
        rows={4}
        maxLength={LIMITS.APPEAL}
        placeholder="Who they are, how you know them and what it's for"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className={cn(FIELD_BASE, FIELD_VARIANTS.soft, "h-auto cursor-text resize-none px-[14px] py-[12px]")}
      />
      <p className="m-0 text-[13px] font-medium text-muted">Appealing doesn&apos;t send the money. The payment stays stopped.</p>
      {error && (
        <p role="alert" className="m-0 text-[14px] font-semibold text-brick">
          {error}
        </p>
      )}
      <div className="flex gap-[10px]">
        <Button type="submit" className="flex-1 disabled:opacity-60" disabled={pending}>
          {pending ? "Sending…" : "Send appeal"}
        </Button>
        <Button variant="secondary" className="flex-1 disabled:opacity-60" disabled={pending} onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
