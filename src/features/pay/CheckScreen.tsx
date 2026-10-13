"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { BackIcon, MicIcon, SendIcon } from "@/components/icons";
import { Screen } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { AuntieBubble, Button, Money, RiskMeter, UserBubble } from "@/components/ui";
import { ROUTES, withTransfer } from "@/constants";
import { VERDICT_CTA, useQuickCheck } from "./QuickCheckProvider";

export function CheckScreen() {
  const { transferId, transfer, nextHref, note, transcript, result, pending, error, answer, retry } = useQuickCheck();
  const [draft, setDraft] = useState("");
  const main = useRef<HTMLElement>(null);
  const firstAnswer = transcript.findIndex((t) => t.role === "user");
  const lastAuntie = transcript.findLastIndex((t) => t.role === "auntie");
  const done = result?.done ?? false;
  const canAnswer = !!result && !pending && !error;

  useEffect(() => {
    main.current?.scrollTo({ top: main.current.scrollHeight, behavior: "smooth" });
  }, [transcript.length, pending, error]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    answer(draft);
    setDraft("");
  }

  if (!transferId) {
    return (
      <Screen className="lg:hidden">
        <main className="flex flex-col items-start gap-[12px] px-[20px] pt-[24px]">
          <h1 className="m-0 font-display text-[22px] leading-[1.1] font-bold">Quick check</h1>
          <p className="m-0 text-[15px] font-semibold">There&apos;s no transfer to check.</p>
          <Link href={ROUTES.PAY} className="flex min-h-[44px] items-center text-[14px] font-semibold text-teal">
            Start a new transfer
          </Link>
        </main>
      </Screen>
    );
  }

  return (
    <Screen className="lg:hidden">
      <header className="sticky top-0 z-[1] flex flex-none flex-col gap-[10px] border-b border-line bg-white pt-[8px] pr-[20px] pb-[14px] pl-[8px] shadow-[0_6px_16px_rgba(15,42,40,.05)]">
        <div className="flex items-center gap-[6px]">
          <Link href={withTransfer(ROUTES.PAY_REVIEW, transferId)} aria-label="Back" className="flex h-[44px] w-[44px] items-center justify-center rounded-[22px]">
            <BackIcon />
          </Link>
          <div className="flex flex-1 flex-col gap-[1px]">
            <h1 className="m-0 font-display text-[19px] leading-[1.1] font-bold">Quick check</h1>
            <span className="text-[13px] font-medium text-muted">
              {transfer ? (
                <>
                  <Money sgd={transfer.amountSgd} /> to {transfer.payeeName}
                </>
              ) : (
                "Loading…"
              )}
            </span>
          </div>
          <div className="flex items-baseline gap-[2px]" aria-live="polite">
            <span className="font-display text-[30px] leading-none font-bold">{result?.score ?? "–"}</span>
            <span className="text-[13px] font-semibold text-muted">/100</span>
          </div>
        </div>
        <div className="flex flex-col gap-[6px] pl-[12px]">
          <RiskMeter score={result?.score ?? 0} />
          <div className="grid grid-cols-[40fr_30fr_31fr] gap-[3px] text-[11px] font-semibold text-muted">
            <span className={result?.verdict === "pass" ? "text-night" : undefined}>Pass 0-39</span>
            <span className={result?.verdict === "warn" ? "text-night" : undefined}>Warn 40-69</span>
            <span className={result?.verdict === "block" ? "text-night" : undefined}>Block 70+</span>
          </div>
          <div className="flex gap-[16px] text-[13px] font-medium text-muted">
            <span>
              Rules <strong className="text-night">{result?.rulesScore ?? "–"}</strong>
            </span>
            <span>
              Model <strong className="text-night">{result?.modelScore ?? "–"}</strong>
            </span>
            <span>{done ? "Done asking" : "Still asking"}</span>
          </div>
        </div>
      </header>
      <main ref={main} className="flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto p-[16px] *:shrink-0">
        <div className="flex items-center gap-[10px]">
          <AuntieBao mood="alarm" width={40} height={37} />
          <span className="text-[13px] font-bold text-teal">Auntie Kumari</span>
        </div>
        {transcript.map((turn, i) => (
          <Fragment key={i}>
            {turn.role === "user" ? (
              <UserBubble className="py-[10px]">{turn.text}</UserBubble>
            ) : i === lastAuntie && result && !pending ? (
              <div className="flex max-w-[300px] flex-col gap-[5px]">
                <AuntieBubble className="rounded-[22px] text-[17px] font-semibold shadow-[inset_0_0_0_2px_var(--color-teal)]">
                  {turn.text}
                </AuntieBubble>
                <span className="pl-[4px] text-[12px] font-medium text-muted">
                  {done ? "Auntie's verdict" : `Question ${result.question} of ${result.maxQuestions}`}
                </span>
              </div>
            ) : (
              <AuntieBubble className="max-w-[290px] rounded-[22px] py-[10px]">{turn.text}</AuntieBubble>
            )}
            {i === firstAnswer && note && (
              <p role="status" className="mx-0 my-[2px] flex items-center gap-[8px] text-[12px] leading-[1.35] font-semibold text-muted">
                <span className="h-[8px] w-[8px] flex-none rounded-[4px] bg-sea"></span>
                {note}
              </p>
            )}
          </Fragment>
        ))}
        {pending && (
          <p role="status" className="m-0 text-[13px] font-semibold text-muted">
            Auntie is thinking…
          </p>
        )}
        {error && (
          <div role="alert" className="flex flex-col items-start gap-[8px] rounded-[16px] border-[2.5px] border-ink bg-sun px-[14px] py-[12px]">
            <p className="m-0 text-[14px] font-semibold">{error}</p>
            <Button variant="secondary" className="h-[44px] px-[18px]" onClick={retry}>
              Try again
            </Button>
          </div>
        )}
        {done && result && (
          <ul className="m-0 flex list-none flex-wrap gap-[6px] p-0" aria-label="Why">
            {result.reasons.map((r) => (
              <li key={r} className="rounded-full bg-wash px-[11px] py-[6px] text-[13px] font-semibold">
                {r}
              </li>
            ))}
          </ul>
        )}
      </main>
      {done && result ? (
        <div className="flex flex-none flex-col gap-[8px] border-t border-line px-[16px] pt-[12px] pb-[20px]">
          <Button href={nextHref}>{VERDICT_CTA[result.verdict]}</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-none flex-col gap-[8px] border-t border-line px-[16px] pt-[12px] pb-[20px]">
          <label htmlFor="answer" className="text-[13px] font-semibold text-muted">
            Your answer
          </label>
          <div className="flex gap-[8px]">
            <button
              type="button"
              aria-label="Answer by voice"
              className="flex h-[52px] w-[52px] flex-none cursor-pointer items-center justify-center rounded-full border-[2.5px] border-teal bg-white px-[6px] py-[1px]"
            >
              <MicIcon />
            </button>
            <input
              id="answer"
              type="text"
              placeholder="Type here"
              maxLength={500}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={!canAnswer}
              className="h-[52px] min-w-0 flex-1 rounded-[16px] border-2 border-ink bg-white px-[14px] text-[16px] font-medium"
            />
            <button
              type="submit"
              aria-label="Send answer"
              disabled={!canAnswer || !draft.trim()}
              className="flex h-[52px] w-[52px] flex-none cursor-pointer items-center justify-center rounded-full border-[2.5px] border-ink bg-teal px-[6px] py-[1px] shadow-hard-xs disabled:cursor-default disabled:opacity-50"
            >
              <SendIcon />
            </button>
          </div>
          <p className="m-0 text-[13px] leading-[1.4] font-medium text-muted">Auntie never asks for your PIN, password or OTP.</p>
        </form>
      )}
    </Screen>
  );
}
