"use client";

import Link from "next/link";
import { BackIcon, SendIcon, SpeakerIcon } from "@/components/icons";
import { AuntieBao } from "@/components/mascot";
import { AuntieBubble, Chip, UserBubble } from "@/components/ui";
import { ROUTES } from "@/constants";
import { speak } from "@/utils";
import { INTRO, MAX_LENGTH, SUGGESTIONS, useAskChat } from "./useAskChat";

const PANEL = "flex flex-col rounded-[24px] border-[2.5px] border-ink shadow-hard-md";

function AuntieTurn({ children }: { children: string }) {
  return (
    <div className="flex max-w-[640px] items-start gap-[12px]">
      <AuntieBao mood="smug" width={52} height={48} />
      <div className="flex flex-col gap-[6px]">
        <span className="text-[13px] font-bold text-teal">Auntie Kumari</span>
        <div className="flex items-end gap-[8px]">
          <AuntieBubble className="rounded-[6px_24px_24px_24px] px-[18px] py-[14px] text-[18px] text-pretty whitespace-pre-line">{children}</AuntieBubble>
          <button
            type="button"
            aria-label="Play her reply aloud"
            onClick={() => speak(children)}
            className="flex h-[44px] w-[44px] flex-none cursor-pointer items-center justify-center rounded-[22px] border-[1.5px] border-line-strong bg-white"
          >
            <SpeakerIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AskDesktop() {
  const { transcript, draft, setDraft, pending, error, endRef, send, handleSubmit } = useAskChat();
  return (
    // Fixed height so the chat scrolls inside its panel and the input stays in view.
    <main className="hidden h-[calc(100dvh-var(--banner-h,0px))] min-w-0 flex-col gap-[24px] bg-white px-[40px] py-[32px] lg:flex">
      <header className="flex flex-col gap-[6px]">
        <Link href={ROUTES.HOME} className="flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-semibold text-teal no-underline">
          <BackIcon size={18} />
          Home
        </Link>
        <div className="flex flex-col gap-[2px]">
          <span className="text-[13px] font-medium text-muted">She reads your ledger only</span>
          <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">Ask Auntie</h1>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] items-start gap-[24px]">
        <section aria-label="Chat with Auntie" className={`${PANEL} h-full min-h-0 overflow-hidden`}>
          <div aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto p-[24px] *:shrink-0 [&>:first-child]:mt-auto">
            <AuntieTurn>{INTRO}</AuntieTurn>
            {transcript.map((turn, i) =>
              turn.role === "user" ? (
                <UserBubble key={i} className="max-w-[420px] rounded-[20px_20px_4px_20px] px-[16px] py-[12px] text-[16px]">
                  {turn.text}
                </UserBubble>
              ) : (
                <AuntieTurn key={i}>{turn.text}</AuntieTurn>
              ),
            )}
            {pending && <p className="m-0 ml-[64px] text-[14px] font-medium text-muted">Auntie is checking your ledger…</p>}
            {error && (
              <p role="alert" className="m-0 rounded-[14px] border-[1.5px] border-brick px-[14px] py-[10px] text-[14px] font-semibold text-brick">
                {error}
              </p>
            )}
            <div ref={endRef}></div>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-none flex-wrap gap-[8px] border-t border-line px-[24px] py-[16px]">
            <label htmlFor="dask-page" className="absolute h-[1px] w-[1px] overflow-hidden [clip:rect(0_0_0_0)]">
              Ask Auntie
            </label>
            <input
              id="dask-page"
              aria-describedby="dask-page-count"
              type="text"
              placeholder="Ask Auntie about your money"
              maxLength={MAX_LENGTH}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="h-[52px] min-w-0 flex-1 rounded-[14px] border-[1.5px] border-slate bg-white px-[16px] text-[16px] font-medium"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={pending || !draft.trim()}
              className="flex h-[52px] w-[52px] flex-none cursor-pointer items-center justify-center rounded-full border-[2.5px] border-ink bg-teal shadow-hard-xs disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SendIcon />
            </button>
            <p id="dask-page-count" className="m-0 w-full text-right text-[12px] font-medium text-muted">{draft.length}/{MAX_LENGTH}</p>
          </form>
        </section>
        <div className="flex flex-col gap-[24px]">
          <section aria-labelledby="dask-try-h" className={`${PANEL} gap-[12px] px-[24px] py-[20px]`}>
            <h2 id="dask-try-h" className="m-0 font-display text-[17px] font-bold">
              Try asking
            </h2>
            {SUGGESTIONS.map((s) => (
              <Chip key={s} disabled={pending} onClick={() => void send(s)} className="text-left disabled:cursor-default disabled:opacity-60">
                {s}
              </Chip>
            ))}
          </section>
          <section aria-labelledby="dask-reads-h" className={`${PANEL} gap-[10px] px-[24px] py-[20px]`}>
            <h2 id="dask-reads-h" className="m-0 font-display text-[17px] font-bold">
              What she reads
            </h2>
            <p className="m-0 text-[14px] leading-[1.5] font-medium text-muted">
              Auntie answers from your ledger: your balance, payments, payees, logged spending and savings goal.
            </p>
            <div className="flex gap-[20px]">
              <Link href={ROUTES.LEDGER} className="flex min-h-[44px] items-center text-[15px] font-semibold text-teal">
                Open ledger
              </Link>
              <Link href={ROUTES.PATTERNS} className="flex min-h-[44px] items-center text-[15px] font-semibold text-teal">
                Your patterns
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
