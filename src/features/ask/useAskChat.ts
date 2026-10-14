"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { askService } from "@/services/ask.service";
import { useSettings } from "@/store/data-hooks";
import { useSettingsStore } from "@/store/settings.store";
import type { AskTurn } from "@/types/ask";
import { errorMessage, speak } from "@/utils";

/** Shown above the chat; not sent, and makes no claim about the user's data. */
export const INTRO = "Ask me anything about your money. I'll check your ledger before I answer.";
export const SUGGESTIONS = ["Can I afford this?", "Where did my money go?", "Am I on track for my goal?"];
/** The API takes at most this many turns and this many characters per turn. */
const MAX_TURNS = 20;
export const MAX_LENGTH = 500;

/** The Ask Auntie chat: transcript, draft, sending, and a ref to keep the latest turn in view. */
export function useAskChat() {
  const [transcript, setTranscript] = useState<AskTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  // Loads settings so voiceReplies is known; send reads the store directly for fresh values.
  useSettings();

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [transcript, pending]);

  async function send(question: string) {
    const text = question.trim().slice(0, MAX_LENGTH);
    if (!text || pending) return;
    const next = [...transcript, { role: "user" as const, text }];
    setTranscript(next);
    setDraft("");
    setPending(true);
    try {
      const { reply } = await askService.send({ transcript: next.slice(-MAX_TURNS) });
      setTranscript([...next, { role: "auntie", text: reply }]);
      // Only once loaded: the default before load has voiceReplies on.
      const { status, settings } = useSettingsStore.getState();
      if (status === "ready" && settings.voiceReplies) speak(reply);
    } catch (err) {
      // Put the question back so it can be sent again.
      setTranscript(transcript);
      setDraft(text);
      toast.error(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void send(draft);
  }

  return { transcript, draft, setDraft, pending, endRef, send, handleSubmit };
}
