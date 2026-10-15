"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** The slice of the Web Speech API we use; lib.dom ships no types for it. */
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type RecognitionCtor = new () => Recognition;

/** The browser's speech recognizer, if it has one. */
function recognizer() {
  const w = window as Window & { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const noop = () => () => {};
const hasRecognizer = () => !!recognizer();
const never = () => false;

/** One-utterance speech-to-text: toggle to listen, the transcript goes to onText. */
export function useDictation(onText: (text: string) => void) {
  // False on the server and first hydration pass, so the markup matches.
  const supported = useSyncExternalStore(noop, hasRecognizer, never);
  const [listening, setListening] = useState(false);
  const rec = useRef<Recognition | null>(null);
  const latest = useRef(onText);

  useEffect(() => {
    latest.current = onText;
  });

  useEffect(() => () => rec.current?.abort(), []);

  function toggle() {
    if (rec.current) return rec.current.stop();
    const Ctor = recognizer();
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = navigator.language || "en-LK";
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => latest.current(e.results[0][0].transcript);
    r.onend = r.onerror = () => {
      rec.current = null;
      setListening(false);
    };
    rec.current = r;
    r.start();
    setListening(true);
  }

  return { supported, listening, toggle };
}
