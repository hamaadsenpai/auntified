"use client";

import {
  GoogleGenAI,
  Modality,
  type LiveServerMessage,
  type Session,
} from "@google/genai";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AUNTIE_VOICE } from "@/constants/voice";
import { guardService } from "@/services/guard.service";
import { errorMessage } from "@/utils";
import {
  parseFlag,
  parseRating,
  GUARD_SYSTEM_PROMPT,
  GUARD_TOOLS,
  type CallRating,
  type ScamFlag,
} from "./config";

export type GuardStatus = "idle" | "connecting" | "listening" | "finishing" | "error";
export type GuardLine = { who: "caller" | "auntie"; text: string };

type Live = {
  session?: Session;
  stream?: MediaStream;
  mic?: AudioContext;
  out?: AudioContext;
  finishing?: boolean;
  quiet?: ReturnType<typeof setTimeout>;
  cap?: ReturnType<typeof setTimeout>;
};

function toBase64(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

/** The live scam-guard session: mic up to Gemini Live, Auntie's voice back, transcript and flags. */
export function useGuard() {
  const [status, setStatus] = useState<GuardStatus>("idle");
  const [lines, setLines] = useState<GuardLine[]>([]);
  const [flags, setFlags] = useState<ScamFlag[]>([]);
  const [rating, setRating] = useState<CallRating | null>(null);
  const live = useRef<Live | null>(null);
  const playing = useRef(new Set<AudioBufferSourceNode>());
  const nextAt = useRef(0);

  const stop = useCallback((next: GuardStatus = "idle") => {
    const l = live.current;
    live.current = null; // before close(): onclose re-enters stop
    clearTimeout(l?.quiet);
    clearTimeout(l?.cap);
    l?.session?.close();
    l?.stream?.getTracks().forEach((t) => t.stop());
    void l?.mic?.close();
    void l?.out?.close();
    playing.current.clear();
    nextAt.current = 0;
    setStatus(next);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const addText = (who: GuardLine["who"], text: string) =>
    setLines((ls) =>
      ls.at(-1)?.who === who
        ? [...ls.slice(0, -1), { who, text: ls.at(-1)!.text + text }]
        : [...ls, { who, text }],
    );

  function play(l: Live, b64: string) {
    const out = l.out!;
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const pcm = new Int16Array(bytes.buffer, 0, bytes.length >> 1);
    const buf = out.createBuffer(1, pcm.length, 24_000);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i] / 0x8000;
    const src = out.createBufferSource();
    src.buffer = buf;
    src.connect(out.destination);
    nextAt.current = Math.max(nextAt.current, out.currentTime);
    src.start(nextAt.current);
    nextAt.current += buf.duration;
    playing.current.add(src);
    src.onended = () => playing.current.delete(src);
  }

  function onMessage(l: Live, msg: LiveServerMessage) {
    if (l.finishing) settle(l);
    const sc = msg.serverContent;
    if (sc?.interrupted) {
      playing.current.forEach((s) => s.stop());
      playing.current.clear();
      nextAt.current = 0;
    }
    if (sc?.inputTranscription?.text)
      addText("caller", sc.inputTranscription.text);
    if (sc?.outputTranscription?.text)
      addText("auntie", sc.outputTranscription.text);
    sc?.modelTurn?.parts?.forEach(
      (p) => p.inlineData?.data && play(l, p.inlineData.data),
    );
    const calls = msg.toolCall?.functionCalls;
    if (calls?.length) {
      const functionResponses = calls.map((c) => {
        let ok = false;
        if (c.name === "flag_scam") {
          const flag = parseFlag(c.args);
          if (flag) setFlags((f) => [...f, flag]);
          ok = !!flag;
        } else if (c.name === "rate_call") {
          const r = parseRating(c.args);
          if (r) setRating(r);
          ok = !!r;
        }
        return { id: c.id, name: c.name, response: { ok } };
      });
      l.session?.sendToolResponse({ functionResponses });
    }
  }

  // After Stop: stop when Auntie has gone quiet and her speech has played out.
  function settle(l: Live) {
    clearTimeout(l.quiet);
    const playback = Math.max(0, nextAt.current - l.out!.currentTime) * 1000;
    l.quiet = setTimeout(() => live.current === l && stop(), playback + 2500);
  }

  // Gemini only transcribes and judges a turn once it hears a pause, so give it one before closing.
  function finish() {
    const l = live.current;
    if (!l?.session || l.finishing) return stop();
    l.finishing = true;
    l.stream?.getTracks().forEach((t) => t.stop());
    const silence = toBase64(new ArrayBuffer(3200));
    for (let i = 0; i < 30; i++)
      l.session.sendRealtimeInput({ audio: { data: silence, mimeType: "audio/pcm;rate=16000" } });
    setStatus("finishing");
    settle(l);
    l.cap = setTimeout(() => live.current === l && stop(), 15_000);
  }

  // Must run from the click: AudioContexts are created before any await to keep the user gesture.
  async function start() {
    if (live.current) return;
    const l: Live = (live.current = {
      mic: new AudioContext(),
      out: new AudioContext({ sampleRate: 24_000 }),
    });
    setStatus("connecting");
    setLines([]);
    setFlags([]);
    setRating(null);
    try {
      void l.out!.resume();
      l.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      const { token, model } = await guardService.token();
      const ai = new GoogleGenAI({
        apiKey: token,
        httpOptions: { apiVersion: "v1alpha" },
      });
      l.session = await ai.live.connect({
        model,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: GUARD_SYSTEM_PROMPT,
          tools: GUARD_TOOLS,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: AUNTIE_VOICE } },
          },
        },
        callbacks: {
          onmessage: (msg) => live.current === l && onMessage(l, msg),
          onerror: () =>
            live.current === l &&
            (toast.error("Auntie lost the line. Try again."), stop("error")),
          onclose: (e) => {
            if (live.current !== l) return;
            if (e.reason) toast.error(e.reason);
            stop();
          },
        },
      });
      if (live.current !== l) return l.session.close(); // stopped while connecting
      await l.mic!.audioWorklet.addModule("/guard-worklet.js");
      if (live.current !== l) return;
      const node = new AudioWorkletNode(l.mic!, "guard-processor");
      node.port.onmessage = (e: MessageEvent<ArrayBuffer>) =>
        l.session?.sendRealtimeInput({
          audio: { data: toBase64(e.data), mimeType: "audio/pcm;rate=16000" },
        });
      l.mic!.createMediaStreamSource(l.stream).connect(node);
      setStatus("listening");
    } catch (err) {
      if (live.current !== l) return;
      toast.error(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Auntie needs the microphone to listen in."
          : errorMessage(err),
      );
      stop("error");
    }
  }

  return { status, lines, flags, rating, start, stop: () => (status === "listening" ? finish() : stop()) };
}
