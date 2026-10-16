"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Screen } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Avatar, Button, Card, FIELD_BASE, FIELD_VARIANTS, Money } from "@/components/ui";
import { LIMITS, ROUTES, withTransfer } from "@/constants";
import { useCurrency, useSettings, useTransfersStore } from "@/store";
import type { Transfer } from "@/types/transfer";
import { cn, errorMessage, speak } from "@/utils";
import { formatMoney } from "@/utils/format";
import { ContactAlertNote, RiskBreakdown } from "./RiskBreakdown";
import { formatWhen, TransferFallback, useTransferParam } from "./transfer-param";
import { PANEL, VerdictDesktop } from "./VerdictDesktop";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export function BlockedScreen() {
  const { transfer, missing } = useTransferParam();
  const currency = useCurrency();
  const { status, settings } = useSettings();
  const headline = transfer?.reasons[0];
  // Only once loaded: the default before load has voiceReplies on.
  const voice = status === "ready" && settings.voiceReplies;
  const line =
    transfer &&
    `I stopped ${formatMoney(transfer.amountSgd, currency)} to ${transfer.payeeName}. ${headline ?? "That is how scams look."}`;
  useEffect(() => {
    if (voice && line) speak(line);
  }, [voice, line]);

  if (!transfer) return <TransferFallback missing={missing} />;

  return (
    <>
      <BlockedDesktop transfer={transfer} headline={headline} />
      <Screen className="lg:hidden">
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
          <Spotted transfer={transfer} className="rounded-[16px] border-[1.5px] border-brick px-[14px] py-[12px]" />
          <ContactAlertNote transfer={transfer} />
          <ContactCard className="flex flex-col gap-[12px] rounded-[22px] px-[16px] py-[14px]" />
          <Appeal id="appeal" transfer={transfer} />
          <Link
            href={withTransfer(ROUTES.PAY_BLOCKED_WHY, transfer.id)}
            className="flex min-h-[44px] items-center justify-center text-[15px] font-semibold text-teal"
          >
            See how she scored it
          </Link>
          <Link href={ROUTES.HOME} className="flex min-h-[44px] items-center justify-center text-[15px] font-semibold text-teal">
            Back to home
          </Link>
          <p className="m-0 mt-auto text-center text-[12px] leading-[1.4] font-medium text-muted">{DISCLAIMER}</p>
        </main>
      </Screen>
    </>
  );
}

const DISCLAIMER = "Auntified is an assistant, not a financial adviser.";

function BlockedDesktop({ transfer, headline }: { transfer: Transfer; headline?: string }) {
  return (
    <VerdictDesktop
      back={{ href: ROUTES.HOME, label: "Back to home" }}
      kicker="Payment stopped"
      title={<>I stopped <Money sgd={transfer.amountSgd} /> to {transfer.payeeName}.</>}
    >
      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start gap-[24px]">
        <div className="flex flex-col gap-[24px]">
          <div role="alert" className={`${PANEL} gap-[14px] bg-brick text-white`}>
            <div className="flex items-center gap-[16px]">
              <span className="flex flex-none rounded-[20px] border-[2.5px] border-ink bg-cream p-[4px]">
                <AuntieBao mood="alarm" width={96} height={89} />
              </span>
              <p className="m-0 flex-1 font-display text-[20px] leading-[1.4] font-medium">{headline ?? "That is how scams look."}</p>
            </div>
            {transfer.score !== null && (
              <span className="flex items-baseline gap-[4px] border-t border-white/30 pt-[12px]">
                <span className="text-[13px] font-semibold">Score</span>
                <span className="font-display text-[32px] leading-none font-bold">{transfer.score}</span>
                <span className="text-[14px] font-semibold">/100</span>
              </span>
            )}
          </div>
          <Spotted transfer={transfer} className={`${PANEL} gap-[8px]`} />
          <ContactAlertNote transfer={transfer} />
          <Link
            href={withTransfer(ROUTES.PAY_BLOCKED_WHY, transfer.id)}
            className="flex min-h-[44px] items-center self-start text-[15px] font-semibold text-teal"
          >
            See how she scored it
          </Link>
        </div>
        <div className="flex flex-col gap-[24px]">
          <ContactCard className={`${PANEL} gap-[14px]`} />
          <section aria-labelledby="dappeal-h" className={`${PANEL} gap-[12px]`}>
            <h2 id="dappeal-h" className="m-0 font-display text-[17px] font-bold">
              Think it&apos;s safe?
            </h2>
            <Appeal id="dappeal" transfer={transfer} />
          </section>
        </div>
      </div>
      <p className="m-0 mt-auto text-[12px] leading-[1.4] font-medium text-muted">{DISCLAIMER}</p>
    </VerdictDesktop>
  );
}

/** Each reason behind the block with its points. */
function Spotted({ transfer, className }: { transfer: Transfer; className: string }) {
  return (
    <div className={cn("flex flex-col gap-[6px]", className)}>
      <span className="text-[12px] font-medium text-muted">What she spotted</span>
      <RiskBreakdown transfer={transfer} />
    </div>
  );
}

function ContactCard({ className }: { className: string }) {
  const contact = useSettings().settings.trustedContact;
  return (
    <Card className={className}>
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
  );
}

/** Records the user's case against the block. The block stays and nothing is sent. */
function Appeal({ id, transfer }: { id: string; transfer: Transfer }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const appealReason = reason.trim();
    if (!appealReason) return toast.error("Tell Auntie why this payment is safe.");
    setPending(true);
    try {
      await useTransfersStore.getState().update(transfer.id, { appealReason });
    } catch (err) {
      toast.error(errorMessage(err));
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
      <label htmlFor={id} className="text-[14px] font-semibold">
        Why is this payment safe?
      </label>
      <textarea
        id={id}
        rows={4}
        maxLength={LIMITS.APPEAL}
        placeholder="Who they are, how you know them and what it's for"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className={cn(FIELD_BASE, FIELD_VARIANTS.soft, "h-auto cursor-text resize-none px-[14px] py-[12px]")}
      />
      <p className="m-0 text-[13px] font-medium text-muted">Appealing doesn&apos;t send the money. The payment stays stopped.</p>
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
