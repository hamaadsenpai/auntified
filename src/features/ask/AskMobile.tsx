"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { SendIcon, SpeakerIcon } from "@/components/icons";
import { BackHeader } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Chip, UserBubble } from "@/components/ui";
import { ROUTES } from "@/constants";
import { askService } from "@/services/ask.service";
import type { ApiFailure } from "@/types/api";
import type { AskTurn } from "@/types/ask";

/** Shown above the chat; not sent, and makes no claim about the user's data. */
const INTRO = "Ask me anything about your money. I'll check your ledger before I answer.";
const SUGGESTIONS = ["Can I afford this?", "Where did my money go?", "Am I on track for my goal?"];
/** The API takes at most this many turns and this many characters per turn. */
const MAX_TURNS = 20;
const MAX_LENGTH = 500;

function AuntieTurn({ children }: { children: string }) {
  return (
    <>
      <div className="flex items-center gap-[10px]">
        <AuntieBao mood="smug" width={40} height={37} />
        <span className="text-[13px] font-bold text-teal">Auntie Kumari</span>
      </div>
      <div className="flex items-end gap-[8px]">
        <div className="flex max-w-[296px] flex-col gap-[10px] rounded-[6px_22px_22px_22px] border-[2.5px] border-ink bg-mint px-[14px] py-[12px]">
          <p className="m-0 font-display text-[16px] leading-[1.4] font-medium whitespace-pre-line">{children}</p>
        </div>
        <button
          type="button"
          aria-label="Play her reply aloud"
          disabled
          aria-disabled="true"
          className="flex h-[44px] w-[44px] flex-none cursor-not-allowed items-center justify-center rounded-[22px] border-[1.5px] border-line-strong bg-white opacity-50"
        >
          <SpeakerIcon />
        </button>
      </div>
    </>
  );
}

export function AskMobile() {
  const [transcript, setTranscript] = useState<AskTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [transcript, pending, error]);

  async function send(question: string) {
    const text = question.trim().slice(0, MAX_LENGTH);
    if (!text || pending) return;
    const next = [...transcript, { role: "user" as const, text }];
    setTranscript(next);
    setDraft("");
    setPending(true);
    setError(null);
    try {
      const { reply } = await askService.send({ transcript: next.slice(-MAX_TURNS) });
      setTranscript([...next, { role: "auntie", text: reply }]);
    } catch (err) {
      // Put the question back so it can be sent again.
      setTranscript(transcript);
      setDraft(text);
      setError((err as ApiFailure["error"])?.message ?? "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void send(draft);
  }

  return (
    <>
      <BackHeader backHref={ROUTES.HOME} title="Ask Auntie" subtitle="She reads your ledger only" className="border-b border-line" />
      <main
        aria-live="polite"
        className="flex min-h-0 flex-1 flex-col gap-[12px] overflow-y-auto px-[16px] py-[18px] *:shrink-0 [&>:first-child]:mt-auto"
      >
        <AuntieTurn>{INTRO}</AuntieTurn>
        {transcript.map((turn, i) =>
          turn.role === "user" ? <UserBubble key={i}>{turn.text}</UserBubble> : <AuntieTurn key={i}>{turn.text}</AuntieTurn>,
        )}
        {pending && <p className="m-0 text-[14px] font-medium text-muted">Auntie is checking your ledger…</p>}
        {error && (
          <p role="alert" className="m-0 rounded-[14px] border-[1.5px] border-brick px-[14px] py-[10px] text-[14px] font-semibold text-brick">
            {error}
          </p>
        )}
        <div ref={endRef}></div>
      </main>
      <div className="flex flex-none flex-col gap-[8px] px-[16px] pb-[12px]">
        <span className="text-[13px] font-semibold text-muted">Try asking</span>
        <div className="flex flex-wrap gap-[8px]">
          {SUGGESTIONS.map((s) => (
            <Chip key={s} disabled={pending} onClick={() => void send(s)} className="disabled:opacity-60">
              {s}
            </Chip>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-none gap-[8px] border-t border-line px-[16px] pt-[12px] pb-[24px]">
        <label htmlFor="ask" className="absolute h-[1px] w-[1px] overflow-hidden [clip:rect(0_0_0_0)]">
          Ask Auntie
        </label>
        <input
          id="ask"
          type="text"
          placeholder="Ask about your money"
          maxLength={MAX_LENGTH}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="h-[52px] min-w-0 flex-1 rounded-[16px] border-2 border-ink bg-white px-[14px] text-[16px] font-medium"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={pending || !draft.trim()}
          className="flex h-[52px] w-[52px] flex-none cursor-pointer items-center justify-center rounded-full border-[2.5px] border-ink bg-teal shadow-hard-xs disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SendIcon />
        </button>
      </form>
    </>
  );
}
