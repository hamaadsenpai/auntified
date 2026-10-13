"use client";

import { useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ROUTES, withTransfer } from "@/constants";
import { checkService } from "@/services/check.service";
import { usePayeesStore, useSettingsStore, useTransfers, useTransfersStore } from "@/store";
import { usePayDraftStore } from "@/store/pay-draft.store";
import type { ApiFailure } from "@/types/api";
import type { CheckResult, CheckTurn, CheckVerdict } from "@/types/check";
import type { Transfer } from "@/types/transfer";

export const VERDICT_ROUTE: Record<CheckVerdict, string> = {
  block: ROUTES.PAY_BLOCKED,
  warn: ROUTES.PAY_WARN,
  pass: ROUTES.HOME,
};

export const VERDICT_CTA: Record<CheckVerdict, string> = {
  block: "See why Auntie stopped it",
  warn: "See Auntie's warning",
  pass: "Send it",
};

type QuickCheck = {
  /** `?id` of the transfer being checked; null when the page was opened without one. */
  transferId: string | null;
  /** Undefined until loaded (or if it does not exist). */
  transfer: Transfer | undefined;
  /** Where the verdict button goes once Auntie is done. */
  nextHref: string;
  /** What the rules found, shown after the first answer. Null when nothing was flagged. */
  note: string | null;
  transcript: CheckTurn[];
  result: CheckResult | null;
  pending: boolean;
  error: string | null;
  answer: (text: string) => void;
  retry: () => void;
};

const QuickCheckContext = createContext<QuickCheck | null>(null);

/**
 * Holds one quick-check conversation for the page. Mobile and desktop layouts render side by side
 * (one hidden by CSS), so the state lives here once instead of in each.
 */
export function QuickCheckProvider({ children }: { children: React.ReactNode }) {
  const transferId = useSearchParams().get("id");
  const transfer = useTransfers().items.find((t) => t.id === transferId);
  const [transcript, setTranscript] = useState<CheckTurn[]>([]);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const ask = useCallback(
    async (next: CheckTurn[]) => {
      if (!transferId) return;
      setPending(true);
      setError(null);
      try {
        const res = await checkService.next({ transferId, transcript: next });
        setResult(res);
        setTranscript([...next, { role: "auntie", text: res.reply }]);
        if (res.done) {
          // The server wrote the verdict onto the transfer; a pass also moved the balance and the payee's count.
          void useTransfersStore.getState().fetchOne(transferId).catch(() => {});
          if (res.verdict === "pass") {
            usePayDraftStore.getState().reset();
            void useSettingsStore.getState().load(true);
            void usePayeesStore.getState().load(true);
          }
        }
      } catch (err) {
        setTranscript(next);
        setError((err as ApiFailure["error"]).message);
      } finally {
        setPending(false);
      }
    },
    [transferId],
  );

  // Ref guard: Strict Mode runs effects twice in dev, and each run would be a Gemini call.
  useEffect(() => {
    if (started.current || !transferId) return;
    started.current = true;
    void ask([]);
  }, [ask, transferId]);

  // Opened by link or after a reload: fetch just this transfer for the header.
  useEffect(() => {
    if (transferId && !transfer) void useTransfersStore.getState().fetchOne(transferId).catch(() => {});
  }, [transferId, transfer]);

  const answer = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending || error || !result || result.done) return;
      const next: CheckTurn[] = [...transcript, { role: "user", text: trimmed }];
      setTranscript(next);
      void ask(next);
    },
    [ask, error, pending, result, transcript],
  );

  const retry = useCallback(() => void ask(transcript), [ask, transcript]);

  const verdict = result?.verdict ?? "pass";
  const nextHref = verdict === "pass" || !transferId ? ROUTES.HOME : withTransfer(VERDICT_ROUTE[verdict], transferId);
  const note = result?.flags.length ? `Checked payee history: ${result.flags.join(", ")}` : null;

  return (
    <QuickCheckContext.Provider value={{ transferId, transfer, nextHref, note, transcript, result, pending, error, answer, retry }}>
      {children}
    </QuickCheckContext.Provider>
  );
}

export function useQuickCheck() {
  const ctx = useContext(QuickCheckContext);
  if (!ctx) throw new Error("useQuickCheck must be used inside <QuickCheckProvider>.");
  return ctx;
}
