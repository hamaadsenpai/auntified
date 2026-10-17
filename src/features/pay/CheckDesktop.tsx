"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { BackIcon, MicIcon, SendIcon } from "@/components/icons";
import { AuntieBao } from "@/components/mascot";
import { AuntieBubble, Button, Money, RiskMeter, UserBubble } from "@/components/ui";
import { ROUTES } from "@/constants";
import { VERDICT_CTA, useQuickCheck } from "./QuickCheckProvider";
import { useDictation } from "./useDictation";

const USER = "max-w-[400px] rounded-[20px_20px_4px_20px] px-[16px] py-[12px] text-[16px]";

export function CheckDesktop() {
  const { transferId, transfer, nextHref, note, transcript, result, pending, error, answer, retry, clear } = useQuickCheck();
  const [draft, setDraft] = useState("");
  const dictation = useDictation((t) => setDraft((d) => (d ? `${d} ${t}` : t)));
  const firstAnswer = transcript.findIndex((t) => t.role === "user");
  const lastAuntie = transcript.findLastIndex((t) => t.role === "auntie");
  const done = result?.done ?? false;
  const canAnswer = !!result && !pending && !error;
  const status = !result ? "Held, Auntie is starting" : done ? `Held, verdict: ${result.verdict}` : `Held, question ${result.question} of ${result.maxQuestions}`;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    answer(draft);
    setDraft("");
  }

  if (!transferId) {
    return (
      <div className="hidden min-h-full min-w-0 flex-1 flex-col items-start gap-[12px] bg-white px-[40px] py-[32px] lg:flex">
        <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">Quick check</h1>
        <p className="m-0 text-[16px] font-semibold">There&apos;s no transfer to check.</p>
        <Link href={ROUTES.PAY} className="flex min-h-[44px] items-center text-[14px] font-semibold text-teal">
          Start a new transfer
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden min-h-full min-w-0 flex-1 grid-cols-[400px_minmax(0,1fr)] bg-white lg:grid">
      <aside className="flex flex-col gap-[24px] border-r border-line bg-panel p-[32px]">
        <Link
          href={ROUTES.PAY}
          className="flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-semibold text-teal no-underline"
        >
          <BackIcon size={18} />
          Back to review
        </Link>
        <div className="sticky top-0 flex flex-col gap-[12px]">
          <span className="text-[13px] font-semibold text-muted">Risk score</span>
          <div className="flex items-baseline gap-[4px]" aria-live="polite">
            <span className="font-display text-[72px] leading-none font-bold">{result?.score ?? "–"}</span>
            <span className="text-[18px] font-semibold text-muted">/100</span>
          </div>
          <RiskMeter score={result?.score ?? 0} height={14} radius={7} markerHeight={22} ring="ring-panel" />
          <div className="grid grid-cols-[40fr_30fr_31fr] gap-[3px] text-[12px] font-semibold text-muted">
            <span className={result?.verdict === "pass" ? "text-night" : undefined}>Pass 0-39</span>
            <span className={result?.verdict === "warn" ? "text-night" : undefined}>Warn 40-69</span>
            <span className={result?.verdict === "block" ? "text-night" : undefined}>Block 70+</span>
          </div>
          <div className="mt-[4px] grid grid-cols-2 gap-[10px]">
            <div className="flex flex-col gap-[2px] rounded-[14px] border border-line-strong bg-white p-[12px]">
              <span className="text-[12px] font-medium text-muted">Rules</span>
              <span className="font-display text-[24px] font-bold">{result?.rulesScore ?? "–"}</span>
            </div>
            <div className="flex flex-col gap-[2px] rounded-[14px] border border-line-strong bg-white p-[12px]">
              <span className="text-[12px] font-medium text-muted">Model</span>
              <span className="font-display text-[24px] font-bold">{result?.modelScore ?? "–"}</span>
            </div>
          </div>
          {done && result && (
            <ul className="m-0 flex list-none flex-col gap-[6px] p-0" aria-label="Why">
              {result.reasons.map((r) => (
                <li key={r} className="rounded-[12px] bg-white px-[12px] py-[8px] text-[14px] font-semibold">
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>
        <dl className="m-0 flex flex-col border-t border-line">
          <div className="flex justify-between border-b border-line py-[12px]">
            <dt className="text-[14px] font-medium text-muted">Amount</dt>
            <dd className="m-0 font-display text-[16px] font-bold">{transfer ? <Money sgd={transfer.amountSgd} /> : "–"}</dd>
          </div>
          <div className="flex justify-between border-b border-line py-[12px]">
            <dt className="text-[14px] font-medium text-muted">To</dt>
            <dd className="m-0 text-[14px] font-semibold">{transfer?.payeeName ?? "–"}</dd>
          </div>
          <div className="flex justify-between py-[12px]">
            <dt className="text-[14px] font-medium text-muted">Status</dt>
            <dd className="m-0 text-[14px] font-semibold">{status}</dd>
          </div>
        </dl>
        <p className="m-0 mt-auto text-[13px] leading-[1.4] font-semibold">Auntie never asks for your PIN, password or OTP.</p>
      </aside>
      <section aria-label="Quick check" className="flex min-w-0 flex-col">
        <header className="flex h-[72px] items-center gap-[12px] border-b border-line px-[32px]">
          <AuntieBao mood="alarm" width={48} height={45} />
          <div className="flex flex-col">
            <h1 className="m-0 font-display text-[20px] leading-[1.1] font-bold">Quick check</h1>
            <span className="text-[13px] font-bold text-teal">Auntie Kumari</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col justify-end gap-[14px] p-[32px]">
          {transcript.map((turn, i) => (
            <Fragment key={i}>
              {turn.role === "user" ? (
                <UserBubble className={USER}>{turn.text}</UserBubble>
              ) : i === 0 ? (
                <AuntieBubble className="max-w-[440px] rounded-[6px_24px_24px_24px] px-[18px] py-[14px] text-[18px]">
                  {turn.text}
                </AuntieBubble>
              ) : i === lastAuntie && result && !pending ? (
                <div className="flex max-w-[460px] flex-col gap-[6px]">
                  <p className="m-0 rounded-[20px] bg-mint px-[18px] py-[16px] font-display text-[20px] leading-[1.4] font-semibold shadow-[inset_0_0_0_2px_var(--color-teal)]">
                    {turn.text}
                  </p>
                  <span className="pl-[4px] text-[12px] font-medium text-muted">
                    {done ? "Auntie's verdict" : `Question ${result.question} of ${result.maxQuestions}`}
                  </span>
                </div>
              ) : (
                <p className="m-0 max-w-[440px] rounded-[20px] bg-mint px-[18px] py-[14px] font-display text-[18px] leading-[1.4] font-medium">
                  {turn.text}
                </p>
              )}
              {i === firstAnswer && note && (
                <p
                  role="status"
                  className="mx-0 my-[4px] flex items-center gap-[8px] self-center rounded-full bg-wash px-[14px] py-[8px] text-[13px] font-semibold text-muted"
                >
                  <span className="h-[8px] w-[8px] rounded-[4px] bg-sea"></span>
                  {note}
                </p>
              )}
            </Fragment>
          ))}
          {pending && (
            <p role="status" className="m-0 text-[14px] font-semibold text-muted">
              Auntie is thinking…
            </p>
          )}
          {error && (
            <div role="alert" className="flex max-w-[460px] items-center gap-[12px] rounded-[16px] border-[2.5px] border-ink bg-sun px-[16px] py-[12px]">
              <p className="m-0 flex-1 text-[15px] font-semibold">{error}</p>
              <Button variant="secondary" className="h-[44px] px-[18px]" onClick={retry}>
                Try again
              </Button>
            </div>
          )}
        </div>
        {done && result ? (
          <div className="flex border-t border-line px-[32px] pt-[16px] pb-[28px]">
            <Button href={nextHref} onClick={clear} className="px-[28px]">
              {VERDICT_CTA[result.verdict]}
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-[8px] border-t border-line px-[32px] pt-[16px] pb-[28px]">
            <label htmlFor="danswer" className="text-[13px] font-semibold text-muted">
              Your answer
            </label>
            <div className="flex gap-[8px]">
              <button
                type="button"
                aria-label="Answer by voice"
                aria-pressed={dictation.listening}
                onClick={dictation.toggle}
                disabled={!canAnswer || !dictation.supported}
                className={`flex h-[52px] w-[52px] flex-none cursor-pointer items-center justify-center rounded-full border-[2.5px] border-teal px-[6px] py-[1px] disabled:cursor-default disabled:opacity-50 ${dictation.listening ? "bg-mint" : "bg-white"}`}
              >
                <MicIcon />
              </button>
              <input
                id="danswer"
                type="text"
                placeholder="Type here"
                maxLength={500}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!canAnswer}
                className="h-[52px] min-w-0 flex-1 rounded-[14px] border-[1.5px] border-slate bg-white px-[16px] text-[16px] font-medium"
              />
              <button
                type="submit"
                disabled={!canAnswer || !draft.trim()}
                className="flex h-[52px] cursor-pointer items-center gap-[8px] rounded-full border-[2.5px] border-ink bg-teal px-[22px] text-[16px] font-semibold text-white shadow-hard-xs disabled:cursor-default disabled:opacity-50"
              >
                Send
                <SendIcon size={18} />
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
