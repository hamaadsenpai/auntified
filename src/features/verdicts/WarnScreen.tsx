"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BackHeader, Screen } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Button, Money, RiskMeter } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useCurrency, usePayeesStore, useSettings, useSettingsStore, useTransfersStore } from "@/store";
import { usePayDraftStore } from "@/store/pay-draft.store";
import type { Transfer } from "@/types/transfer";
import { errorMessage, speak } from "@/utils";
import { convertFromSgd } from "@/utils/format";
import { useNow } from "@/features/roast/week";
import { ContactAlertNote, RiskBreakdown } from "./RiskBreakdown";
import { formatWhen, TransferFallback, useTransferParam } from "./transfer-param";
import { PANEL, VerdictDesktop } from "./VerdictDesktop";

export function WarnScreen() {
  const router = useRouter();
  const currency = useCurrency();
  const { transfer, missing } = useTransferParam();
  const now = useNow();
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState<"overridden" | "cancelled" | null>(null);
  const { status, settings } = useSettings();
  // Only once loaded: the default before load has voiceReplies on.
  const voice = status === "ready" && settings.voiceReplies;
  const line = transfer && `${transfer.payeeName}, this amount, right now? Not like you.`;
  useEffect(() => {
    if (voice && line) speak(line);
  }, [voice, line]);

  if (!transfer) return <TransferFallback missing={missing} />;

  const score = transfer.score ?? transfer.rulesScore;
  const phrase = `SEND ${Math.round(convertFromSgd(transfer.amountSgd, currency))}`;
  // Until the cooling-off ends, or while the bank holds it, "pay anyway" stays off (the server enforces both).
  const coolingOff = transfer.holdUntil !== null && (now === null || Date.parse(transfer.holdUntil) > now.getTime());
  const bankHold = transfer.review?.action === "hold";
  // Stays open while a decision saves, so the form doesn't flicker before the redirect.
  const open = transfer.status === "warned" || pending !== null;

  async function decide(status: "overridden" | "cancelled") {
    if (!transfer) return;
    setPending(status);
    try {
      await useTransfersStore.getState().update(transfer.id, { status });
      // Paying anyway sends the money like a pass: it moves the balance and the payee's count.
      if (status === "overridden") {
        usePayDraftStore.getState().reset();
        void useSettingsStore.getState().load(true);
        void usePayeesStore.getState().load(true);
      }
      router.push(ROUTES.HOME);
    } catch (err) {
      toast.error(errorMessage(err));
      setPending(null);
    }
  }

  const view: WarnView = { transfer, score, phrase, open, confirm, setConfirm, pending, decide, locked: coolingOff || bankHold };

  return (
    <>
      <WarnDesktop {...view} />
      <Screen className="lg:hidden">
        <BackHeader backHref={ROUTES.PAY} title="Hold on" subtitle={<Subtitle transfer={transfer} />} />
        <main className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-[20px] pt-[4px] pb-[16px] *:shrink-0">
          <div role="alert" className="flex flex-col gap-[10px] rounded-[18px] border-[2.5px] border-ink bg-sun p-[16px]">
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] font-bold tracking-[.06em] uppercase">Warn</span>
              <span className="flex items-baseline gap-[2px]">
                <span className="font-display text-[30px] leading-none font-bold">{score}</span>
                <span className="text-[13px] font-semibold">/100</span>
              </span>
            </div>
            <RiskMeter score={score} middle="white" ring="ring-sun" />
            <div className="flex items-center gap-[10px]">
              <AuntieBao mood="meh" width={52} height={48} />
              <p className="m-0 font-display text-[16px] leading-[1.4] font-medium">
                {transfer.payeeName}, this amount, right now? Not like you.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-[2px]">
            <h2 className="m-0 mb-[4px] font-display text-[16px] font-bold">What worries her</h2>
            <RiskBreakdown transfer={transfer} />
          </div>
          <ContactAlertNote transfer={transfer} />
          {open ? <ConfirmField id="confirm" {...view} /> : <Decided transfer={transfer} />}
        </main>
        {open && (
          <div className="flex flex-none flex-col gap-[10px] px-[20px] pt-[12px] pb-[24px]">
            <DecideButtons {...view} />
          </div>
        )}
      </Screen>
    </>
  );
}

type WarnView = {
  transfer: Transfer;
  score: number;
  phrase: string;
  open: boolean;
  /** Cooling off or held by the bank: "pay anyway" is off. */
  locked: boolean;
  confirm: string;
  setConfirm: (value: string) => void;
  pending: "overridden" | "cancelled" | null;
  decide: (status: "overridden" | "cancelled") => Promise<void>;
};

function WarnDesktop(view: WarnView) {
  const { transfer, score, open } = view;
  return (
    <VerdictDesktop back={{ href: ROUTES.PAY, label: "Back to pay" }} kicker={<Subtitle transfer={transfer} />} title="Hold on">
      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start gap-[24px]">
        <div className="flex flex-col gap-[24px]">
          <div role="alert" className={`${PANEL} gap-[16px] bg-sun`}>
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-bold tracking-[.06em] uppercase">Warn</span>
              <span className="flex items-baseline gap-[4px]">
                <span className="font-display text-[56px] leading-none font-bold">{score}</span>
                <span className="text-[16px] font-semibold">/100</span>
              </span>
            </div>
            <RiskMeter score={score} middle="white" ring="ring-sun" height={14} radius={7} markerHeight={22} />
            <div className="flex items-center gap-[14px]">
              <AuntieBao mood="meh" width={80} height={74} />
              <p className="m-0 font-display text-[20px] leading-[1.4] font-medium">
                {transfer.payeeName}, this amount, right now? Not like you.
              </p>
            </div>
          </div>
          <section aria-labelledby="dworries-h" className={`${PANEL} gap-[2px]`}>
            <h2 id="dworries-h" className="m-0 mb-[4px] font-display text-[17px] font-bold">
              What worries her
            </h2>
            <RiskBreakdown transfer={transfer} />
          </section>
          <ContactAlertNote transfer={transfer} />
        </div>
        <section aria-labelledby="ddecide-h" className={`${PANEL} gap-[16px]`}>
          <h2 id="ddecide-h" className="m-0 font-display text-[17px] font-bold">
            Your call
          </h2>
          {open ? <ConfirmField id="dconfirm" {...view} /> : <Decided transfer={transfer} />}
          {open && (
            <div className="grid grid-cols-2 gap-[10px]">
              <DecideButtons {...view} />
            </div>
          )}
        </section>
      </div>
    </VerdictDesktop>
  );
}

function Subtitle({ transfer }: { transfer: Transfer }) {
  return (
    <>
      <Money sgd={transfer.amountSgd} /> to {transfer.payeeName}, {formatWhen(transfer.createdAt)}
    </>
  );
}

function ConfirmField({ id, transfer, phrase, confirm, setConfirm, locked }: { id: string } & WarnView) {
  if (locked) {
    return (
      <p role="status" className="m-0 rounded-[16px] bg-wash px-[14px] py-[12px] text-[14px] leading-[1.4] font-medium">
        {transfer.review?.action === "hold"
          ? "The bank is holding this payment for review. You can still cancel it."
          : `Cooling off: you can pay anyway after ${formatWhen(transfer.holdUntil!, ", ")}. Talk to someone you trust first.`}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-[8px]">
      <label htmlFor={id} className="text-[15px] font-semibold">
        Type {phrase} to pay anyway
      </label>
      <input
        id={id}
        type="text"
        placeholder={phrase}
        autoComplete="off"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="h-[52px] rounded-[16px] border-2 border-ink bg-white px-[14px] font-mono text-[16px] font-semibold tracking-[.04em]"
      />
      <span className="text-[13px] leading-[1.4] font-medium text-muted">
        Overrides are logged in your{" "}
        <Link href={ROUTES.LEDGER} className="font-semibold text-teal">
          decision log
        </Link>
        .
      </span>
    </div>
  );
}

function Decided({ transfer }: { transfer: Transfer }) {
  return (
    <p className="m-0 text-[14px] font-medium text-muted">
      This payment is already {transfer.status}.{" "}
      <Link href={ROUTES.HOME} className="font-semibold text-teal">
        Back to home
      </Link>
    </p>
  );
}

function DecideButtons({ phrase, confirm, pending, decide, locked }: WarnView) {
  return (
    <>
      <Button
        className="disabled:opacity-60"
        disabled={pending !== null || locked || confirm.trim().toUpperCase() !== phrase}
        onClick={() => void decide("overridden")}
      >
        {pending === "overridden" ? "Sending…" : "Pay anyway"}
      </Button>
      <Button variant="secondary" className="disabled:opacity-60" disabled={pending !== null} onClick={() => void decide("cancelled")}>
        {pending === "cancelled" ? "Cancelling…" : "Cancel"}
      </Button>
    </>
  );
}
