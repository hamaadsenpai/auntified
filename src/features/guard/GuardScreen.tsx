"use client";

import { Fragment } from "react";
import { Screen } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Button } from "@/components/ui";
import { cn } from "@/utils";
import type { ScamFlag } from "./config";
import { useGuard, type GuardStatus } from "./useGuard";

const STATUS: Record<GuardStatus, string> = {
  idle: "Ready when you are",
  connecting: "Connecting…",
  listening: "Auntie is listening",
  finishing: "Auntie is thinking…",
  error: "Something went wrong",
};

/** The text with every flagged quote wrapped in <mark> (case-insensitive substring match). */
function Highlighted({ text, flags }: { text: string; flags: ScamFlag[] }) {
  const quotes = flags.map((f) => f.quote.trim()).filter(Boolean);
  if (!quotes.length) return text;
  const re = new RegExp(
    `(${quotes.map((q) => q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "i",
  );
  return text.split(re).map((part, i) =>
    i % 2 ? (
      <mark key={i} className="rounded-[4px] bg-sun px-[2px] font-semibold">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

type Guard = ReturnType<typeof useGuard>;

function Controls({ guard: { status, flags, rating, start, stop } }: { guard: Guard }) {
  const active = status === "connecting" || status === "listening" || status === "finishing";
  return (
    <>
      <div className="flex items-center gap-[12px]">
        <AuntieBao mood={flags.length ? "alarm" : active ? "smug" : "sleep"} width={60} height={56} />
        <p role="status" className="m-0 font-display text-[16px] leading-[1.4] font-medium text-muted">
          {STATUS[status]}
        </p>
      </div>
      {rating && (
        <p className="m-0 text-[15px] font-semibold">
          Scam risk: {Math.round(rating.risk)}%
          <span className="font-medium text-muted"> · {rating.reason}</span>
        </p>
      )}
      {active ? (
        <Button variant="secondary" onClick={stop}>
          Stop
        </Button>
      ) : (
        <Button onClick={() => void start()}>Put the call on speaker</Button>
      )}
    </>
  );
}

function Results({ guard: { lines, flags } }: { guard: Guard }) {
  return (
    <>
      {flags.length > 0 && (
        <section
          aria-label="Flagged"
          className="flex flex-col gap-[6px] rounded-[16px] border-[2.5px] border-ink bg-cream px-[16px] py-[12px] shadow-hard-md"
        >
          {flags.map((f, i) => (
            <p key={i} className="m-0 text-[14px] font-semibold">
              {f.type.replaceAll("_", " ")} ({Math.round(f.confidence * 100)}
              %): &ldquo;{f.quote}&rdquo;
            </p>
          ))}
        </section>
      )}
      <section aria-label="Transcript" className="flex flex-col gap-[8px]">
        {lines.map((l, i) => (
          <p key={i} className={cn("m-0 text-[15px] leading-[1.4]", l.who === "auntie" ? "font-semibold text-teal" : "font-medium")}>
            <span className="text-[12px] font-medium text-muted">{l.who === "auntie" ? "Auntie" : "Call"}: </span>
            <Highlighted text={l.text} flags={flags} />
          </p>
        ))}
      </section>
    </>
  );
}

/** Put a call on speaker and Auntie listens in, warning out loud when it sounds like a scam. */
export function GuardScreen() {
  // One session for the page: mobile and desktop render side by side (one hidden by CSS).
  const guard = useGuard();
  return (
    <>
      <main className="hidden min-h-dvh min-w-0 flex-col gap-[24px] bg-white px-[40px] py-[32px] lg:flex">
        <header className="flex flex-col gap-[2px]">
          <span className="text-[13px] font-medium text-muted">Auntie listens in and warns you out loud</span>
          <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">Call guard</h1>
        </header>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-[24px]">
          <section className="flex flex-col gap-[18px] rounded-[24px] border-[2.5px] border-ink px-[24px] py-[20px] shadow-hard-md">
            <Controls guard={guard} />
          </section>
          <div className="flex flex-col gap-[18px] rounded-[24px] border-[2.5px] border-ink px-[24px] py-[20px] shadow-hard-md">
            <Results guard={guard} />
          </div>
        </div>
      </main>
      <Screen className="lg:hidden">
        <header className="flex h-[64px] flex-none items-center px-[20px]">
          <h1 className="m-0 font-display text-[22px] leading-[1.1] font-bold">Call guard</h1>
        </header>
        <main className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-[20px] pb-[20px] *:shrink-0">
          <Controls guard={guard} />
          <Results guard={guard} />
        </main>
      </Screen>
    </>
  );
}
