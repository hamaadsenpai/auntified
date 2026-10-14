"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BackIcon } from "@/components/icons";
import { Button, Money, Tag } from "@/components/ui";
import { ROUTES } from "@/constants";
import { formatWhen, RiskBreakdown } from "@/features/verdicts";
import { analystService } from "@/services/analyst.service";
import { useSettingsStore, useTransfersStore } from "@/store";
import type { FlaggedTransfer } from "@/types/analyst";
import type { ReviewAction } from "@/types/transfer";
import { errorMessage } from "@/utils";

const PANEL = "flex flex-col rounded-[24px] border-[2.5px] border-ink px-[20px] py-[18px] shadow-hard-md";

const ACTIONS: { action: ReviewAction; label: string; done: string }[] = [
  { action: "approve", label: "Approve", done: "Approved and sent." },
  { action: "hold", label: "Hold", done: "Held for review. The customer can't send it anyway." },
  { action: "report", label: "Report", done: "Reported. Blocked, and the payee is marked as a scam." },
];

const REVIEWED: Record<ReviewAction, string> = { approve: "Approved", hold: "Held", report: "Reported" };

const sameItem = (a: FlaggedTransfer, b: { uid: string; id: string }) => a.uid === b.uid && a.id === b.id;

/** The bank side: every customer's warned and blocked transfers, riskiest first, to approve, hold or report. */
export function AnalystScreen() {
  const [items, setItems] = useState<FlaggedTransfer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    analystService.list().then(setItems, (err) => setError(errorMessage(err)));
  }, []);
  useEffect(load, [load]);

  async function review(item: FlaggedTransfer, action: ReviewAction) {
    setBusy(`${item.uid}/${item.id}`);
    try {
      const updated = await analystService.review({ uid: item.uid, transferId: item.id, action });
      const stillFlagged = updated.status === "warned" || updated.status === "blocked";
      setItems((list) =>
        (list ?? []).flatMap((i) => (sameItem(i, item) ? (stillFlagged ? [{ ...i, ...updated }] : []) : [i])),
      );
      toast.success(ACTIONS.find((a) => a.action === action)!.done);
      // In demo mode the analyst may be the customer too: their own history and balance changed.
      void useTransfersStore.getState().load(true);
      void useSettingsStore.getState().load(true);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="flex min-h-dvh min-w-0 flex-col gap-[20px] bg-white px-[20px] py-[20px] lg:gap-[24px] lg:px-[40px] lg:py-[32px]">
      <header className="flex flex-col gap-[2px]">
        <Link href={ROUTES.SETTINGS} className="mb-[4px] flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-semibold text-teal no-underline">
          <BackIcon size={18} />
          Settings
        </Link>
        <span className="text-[13px] font-medium text-muted">Bank side: flagged transfers across every customer</span>
        <h1 className="m-0 font-display text-[26px] leading-[1.1] font-bold lg:text-[30px]">Analyst queue</h1>
      </header>
      {error ? (
        <div className="flex flex-col items-start gap-[4px]">
          <p role="alert" className="m-0 text-[14px] font-semibold text-brick">
            {error === "Not found." ? "The analyst queue is for bank staff only." : error}
          </p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              load();
            }}
            className="min-h-[44px] cursor-pointer border-none bg-transparent p-0 text-[14px] font-semibold text-teal">
            Try again
          </button>
        </div>
      ) : !items ? (
        <p className="m-0 text-[14px] font-medium text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="m-0 text-[15px] font-medium text-muted">Queue is clear. No warned or blocked transfers.</p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 items-start gap-[20px] p-0 xl:grid-cols-2">
          {items.map((t) => (
            <li key={`${t.uid}/${t.id}`} className={`${PANEL} gap-[12px]`}>
              <div className="flex items-start justify-between gap-[12px]">
                <div className="flex min-w-0 flex-col gap-[2px]">
                  <span className="font-display text-[18px] font-bold break-words">
                    <Money sgd={t.amountSgd} /> to {t.payeeName}
                  </span>
                  <span className="text-[13px] font-medium break-words text-muted">
                    {t.userEmail ?? "Unknown customer"} · {formatWhen(t.createdAt, ", ")}
                    {t.reference && ` · “${t.reference}”`}
                  </span>
                </div>
                <span className="flex flex-none flex-col items-end gap-[4px]">
                  <Tag variant={t.status === "blocked" ? "blocked" : "outline"}>{t.status === "blocked" ? "Blocked" : "Warned"}</Tag>
                  {t.review && <Tag variant="passed">{REVIEWED[t.review.action]}</Tag>}
                </span>
              </div>
              <RiskBreakdown transfer={t} />
              {t.appeal && (
                <p className="m-0 rounded-[14px] bg-wash px-[12px] py-[10px] text-[14px] font-medium break-words">
                  <span className="font-semibold">Customer&apos;s appeal:</span> “{t.appeal.reason}”
                </p>
              )}
              <div className="grid grid-cols-3 gap-[8px]">
                {ACTIONS.map(({ action, label }) => (
                  <Button
                    key={action}
                    variant={action === "approve" ? "primary" : "secondary"}
                    className="h-[44px] text-[14px] disabled:opacity-60"
                    disabled={busy !== null || t.review?.action === action}
                    onClick={() => void review(t, action)}
                  >
                    {busy === `${t.uid}/${t.id}` ? "…" : label}
                  </Button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
