"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackHeader, Screen } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Button, Money, RiskMeter } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useCurrency, useTransfersStore } from "@/store";
import type { ApiFailure } from "@/types/api";
import { convertFromSgd } from "@/utils/format";
import { formatWhen, TransferFallback, useTransferParam } from "./transfer-param";

export function WarnScreen() {
  const router = useRouter();
  const currency = useCurrency();
  const { transfer, missing } = useTransferParam();
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState<"overridden" | "cancelled" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!transfer) return <TransferFallback missing={missing} />;

  const score = transfer.score ?? transfer.rulesScore;
  const phrase = `SEND ${Math.round(convertFromSgd(transfer.amountSgd, currency))}`;
  const worries = [...new Set([...transfer.reasons, ...transfer.flags])];
  // Stays open while a decision saves, so the form doesn't flicker before the redirect.
  const open = transfer.status === "warned" || pending !== null;

  async function decide(status: "overridden" | "cancelled") {
    if (!transfer) return;
    setPending(status);
    setError(null);
    try {
      await useTransfersStore.getState().update(transfer.id, { status });
      router.push(ROUTES.HOME);
    } catch (err) {
      setError((err as ApiFailure["error"])?.message ?? "Something went wrong. Try again.");
      setPending(null);
    }
  }

  return (
    <Screen>
      <BackHeader
        backHref={ROUTES.PAY}
        title="Hold on"
        subtitle={<><Money sgd={transfer.amountSgd} /> to {transfer.payeeName}, {formatWhen(transfer.createdAt)}</>}
      />
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
          {worries.length === 0 ? (
            <span className="py-[10px] text-[14px] font-medium text-muted">She did not give a reason.</span>
          ) : (
            worries.map((worry, i) => (
              <div key={worry} className={i < worries.length - 1 ? "flex flex-col gap-[2px] border-b border-line py-[10px]" : "flex flex-col gap-[2px] py-[10px]"}>
                <span className="text-[15px] font-semibold">{worry}</span>
              </div>
            ))
          )}
        </div>
        {open ? (
          <div className="flex flex-col gap-[8px]">
            <label htmlFor="confirm" className="text-[15px] font-semibold">
              Type {phrase} to pay anyway
            </label>
            <input
              id="confirm"
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
        ) : (
          <p className="m-0 text-[14px] font-medium text-muted">
            This payment is already {transfer.status}.{" "}
            <Link href={ROUTES.HOME} className="font-semibold text-teal">
              Back to home
            </Link>
          </p>
        )}
        {error && (
          <p role="alert" className="m-0 rounded-[14px] border-[1.5px] border-brick px-[14px] py-[10px] text-[14px] font-semibold text-brick">
            {error}
          </p>
        )}
      </main>
      {open && (
        <div className="flex flex-none flex-col gap-[10px] px-[20px] pt-[12px] pb-[24px]">
          <Button
            className="disabled:opacity-60"
            disabled={pending !== null || confirm.trim().toUpperCase() !== phrase}
            onClick={() => void decide("overridden")}
          >
            {pending === "overridden" ? "Sending…" : "Pay anyway"}
          </Button>
          <Button variant="secondary" className="disabled:opacity-60" disabled={pending !== null} onClick={() => void decide("cancelled")}>
            {pending === "cancelled" ? "Cancelling…" : "Cancel"}
          </Button>
        </div>
      )}
    </Screen>
  );
}
