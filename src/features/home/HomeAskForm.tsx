"use client";

import { type FormEvent, useState } from "react";
import { SendIcon, SpeakerIcon } from "@/components/icons";
import { AuntieBubble, Chip, UserBubble } from "@/components/ui";
import { askService } from "@/services/ask.service";
import type { ApiFailure } from "@/types/api";
import type { AskTurn } from "@/types/ask";

const SUGGESTIONS = ["Can I afford this?", "Where did my money go?", "Am I on track?"];

/** Home's Ask Auntie box: the chat so far, the question input and suggestion chips. */
export function HomeAskForm() {
  const [transcript, setTranscript] = useState<AskTurn[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || pending) return;
    const previous = transcript;
    const next: AskTurn[] = [...previous, { role: "user", text: question }];
    setTranscript(next);
    setInput("");
    setError(null);
    setPending(true);
    try {
      const { reply } = await askService.send({ transcript: next });
      setTranscript([...next, { role: "auntie", text: reply }]);
    } catch (err) {
      // Put the question back so it can be sent again.
      setTranscript(previous);
      setInput(question);
      setError((err as ApiFailure["error"]).message);
    } finally {
      setPending(false);
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <>
      {transcript.map((turn, i) =>
        turn.role === "user" ? (
          <UserBubble key={i} className="max-w-[360px] rounded-[20px_20px_4px_20px] px-[16px] py-[12px]">
            {turn.text}
          </UserBubble>
        ) : (
          <div key={i} className="flex max-w-[520px] items-end gap-[8px]">
            <AuntieBubble className="rounded-[6px_24px_24px_24px] px-[18px] py-[14px] text-[18px] text-pretty">{turn.text}</AuntieBubble>
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-label="Play her reply aloud (coming soon)"
              className="flex h-[44px] w-[44px] flex-none items-center justify-center rounded-[22px] border-[1.5px] border-line-strong bg-white opacity-50"
            >
              <SpeakerIcon />
            </button>
          </div>
        ),
      )}
      {pending && (
        <p aria-live="polite" className="m-0 text-[14px] font-medium text-muted">
          Auntie is thinking…
        </p>
      )}
      <form onSubmit={onSubmit} className="mt-auto flex flex-wrap items-center gap-[8px]">
        <label htmlFor="dask" className="absolute h-[1px] w-[1px] overflow-hidden [clip:rect(0_0_0_0)]">
          Ask Auntie
        </label>
        <input
          id="dask"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Auntie about your money"
          className="h-[52px] min-w-[240px] flex-1 rounded-[14px] border-[1.5px] border-slate bg-white px-[16px] text-[16px] font-medium"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={pending || !input.trim()}
          className="flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-full border-[2.5px] border-ink bg-teal shadow-hard-xs disabled:cursor-default disabled:opacity-60"
        >
          <SendIcon />
        </button>
        {error && (
          <p role="alert" className="m-0 w-full rounded-[14px] border-[1.5px] border-brick px-[14px] py-[10px] text-[14px] font-semibold text-brick">
            {error}
          </p>
        )}
        <div className="flex w-full gap-[8px]">
          {SUGGESTIONS.map((s) => (
            <Chip key={s} disabled={pending} onClick={() => void send(s)} className="border-[1.5px] disabled:cursor-default disabled:opacity-60">
              {s}
            </Chip>
          ))}
        </div>
      </form>
    </>
  );
}
