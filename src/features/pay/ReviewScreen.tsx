"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BackHeader, Screen } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Avatar, Button, Money, Tag } from "@/components/ui";
import { ROUTES, withTransfer } from "@/constants";
import { usePayees, useSettings, useTransfers, useTransfersStore } from "@/store";
import { usePayDraftStore } from "@/store/pay-draft.store";
import { errorMessage } from "@/utils";
import { accountOf, sendableSgd } from "@/utils/accounts";
import { initials, isNewPayee, transfersLabel } from "./PayScreen";

export function ReviewScreen() {
  const id = useSearchParams().get("id");
  const router = useRouter();
  const { items } = useTransfers();
  const payees = usePayees();
  const { settings } = useSettings();
  const [missing, setMissing] = useState(false);
  const [pending, setPending] = useState(false);
  const transfer = id ? items.find((t) => t.id === id) : undefined;
  const payee = transfer && payees.items.find((p) => p.id === transfer.payeeId);

  // Opened by link or after a reload: fetch just this transfer rather than wait for the list.
  useEffect(() => {
    if (!id || transfer) return;
    useTransfersStore
      .getState()
      .fetchOne(id)
      .catch(() => setMissing(true));
  }, [id, transfer]);

  async function cancel() {
    if (!transfer || !window.confirm("Cancel this transfer? Nothing will be sent.")) return;
    setPending(true);
    try {
      await useTransfersStore.getState().update(transfer.id, { status: "cancelled" });
      usePayDraftStore.getState().reset();
      router.push(ROUTES.HOME);
    } catch (err) {
      toast.error(errorMessage(err));
      setPending(false);
    }
  }

  // Only a pending transfer can still be reviewed and checked.
  const notice =
    !id || missing
      ? "We couldn't find that transfer."
      : transfer?.status === "expired"
        ? "This transfer expired before Auntie checked it."
        : transfer && transfer.status !== "pending"
          ? "Auntie has already checked this transfer."
          : null;

  if (notice || !transfer) {
    return (
      <Screen className="lg:hidden">
        <BackHeader backHref={ROUTES.PAY} title="Review transfer" />
        <main className="flex flex-col items-start gap-[12px] px-[20px] pt-[8px]">
          {!notice ? (
            <p className="m-0 text-[14px] font-medium text-muted">Loading…</p>
          ) : (
            <>
              <p className="m-0 text-[15px] font-semibold">{notice}</p>
              <Link href={ROUTES.PAY} className="flex min-h-[44px] items-center text-[14px] font-semibold text-teal">
                Start a new transfer
              </Link>
            </>
          )}
        </main>
      </Screen>
    );
  }

  const from = accountOf(settings, transfer.fromAccountId);
  const availableSgd = sendableSgd(settings, from);
  return (
    <Screen className="lg:hidden">
      <BackHeader backHref={ROUTES.PAY} title="Review transfer" />
      <main className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto px-[20px] pt-[8px] pb-[20px] *:shrink-0">
        <div className="flex flex-col items-center gap-[4px] pt-[8px] pb-[6px]">
          <span className="text-[13px] font-medium text-muted">You are sending</span>
          <span className="font-display text-[48px] leading-none font-bold"><Money sgd={transfer.amountSgd} /></span>
        </div>
        <Link
          href={ROUTES.PAYEE(transfer.payeeId)}
          className="flex items-center gap-[12px] rounded-[22px] border-[2.5px] border-ink px-[16px] py-[14px] text-night no-underline shadow-hard-sm"
        >
          <Avatar initials={initials(transfer.payeeName)} size={44} className="flex-none bg-track text-[15px] text-teal" />
          <span className="flex flex-1 flex-col gap-[2px]">
            <span className="text-[16px] font-semibold">{transfer.payeeName}</span>
            {payee && <span className="text-[13px] font-medium text-muted">{payee.account}</span>}
          </span>
          {payee && (
            <span className="flex flex-col items-end gap-[3px]">
              {isNewPayee(payee) && (
                <Tag variant="outline" className="py-[4px]">
                  New payee
                </Tag>
              )}
              <span className="text-[12px] font-semibold">{transfersLabel(payee.transferCount)}</span>
            </span>
          )}
        </Link>
        <dl className="m-0 flex flex-col border-t border-line">
          <div className="flex justify-between gap-[12px] border-b border-line py-[12px]">
            <dt className="text-[14px] font-medium text-muted">From</dt>
            <dd className="m-0 flex flex-col gap-[2px] text-right text-[14px] font-semibold">
              {from.name}<span className="text-[13px] font-medium text-muted"><Money sgd={availableSgd} /> available</span>
            </dd>
          </div>
          <div className="flex justify-between gap-[12px] border-b border-line py-[12px]">
            <dt className="text-[14px] font-medium text-muted">Reference</dt>
            <dd className="m-0 text-[14px] font-semibold">{transfer.reference || "None"}</dd>
          </div>
        </dl>
        {transfer.flags.length > 0 && (
          <div role="alert" className="flex flex-col gap-[10px] rounded-[16px] border-[2.5px] border-ink bg-sun px-[16px] py-[14px]">
            <div className="flex items-center gap-[10px]">
              <AuntieBao mood="alarm" width={52} height={48} />
              <span className="font-display text-[17px] leading-[1.3] font-semibold">
                Wait wait wait. Auntie wants a word before this goes.
              </span>
            </div>
            <ul className="m-0 flex list-none flex-wrap gap-[6px] p-0">
              {transfer.flags.map((f) => (
                <li key={f} className="rounded-full bg-white px-[11px] py-[6px] text-[13px] font-semibold">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <div className="flex flex-none flex-col gap-[10px] px-[20px] pt-[12px] pb-[24px]">
        <Button href={withTransfer(ROUTES.PAY_CHECK, transfer.id)}>Continue to Auntie&apos;s check</Button>
        <Button variant="secondary" className="px-[6px] py-[1px] disabled:opacity-50" onClick={() => void cancel()} disabled={pending}>
          {pending ? "Cancelling…" : "Cancel transfer"}
        </Button>
      </div>
    </Screen>
  );
}
