import "server-only";
import { Modality } from "@google/genai";
import { gemini } from "@/lib/ai/gemini";
import { ApiError } from "@/lib/api/errors";
import { AUNTIE_ACCENT, AUNTIE_VOICE } from "@/constants/voice";
import { env } from "@/lib/env.server";
import type { SpeakResult } from "@/types/speak";

function stylePrompt(language: string) {
  return `Read the text after the colon aloud word for word, in ${language}, as a sharp, caring auntie looking out for family. ${AUNTIE_ACCENT} Never introduce yourself or say any name. Do not add or leave out any words:`;
}

/** Browsers can't play raw PCM, so wrap Gemini's 16-bit mono PCM in a 44-byte WAV header. */
function toWav(pcm: Buffer, rate: number) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28); // bytes per second
  header.writeUInt16LE(2, 32); // bytes per sample
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/** Auntie reading `text` aloud with Gemini TTS, as a playable data URL. */
export async function speakText(text: string, language: string): Promise<SpeakResult> {
  let audio: { data?: string; mimeType?: string } | undefined;
  try {
    const res = await gemini.models.generateContent({
      model: env.GEMINI_TTS_MODEL,
      contents: `${stylePrompt(language)}\n${text}`,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: AUNTIE_VOICE } } },
      },
    });
    audio = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
  } catch (err) {
    console.error("[speak] Gemini call failed", err);
    throw new ApiError(502, "AI_UNAVAILABLE", "Auntie lost her voice. Try again in a moment.");
  }
  if (!audio?.data) {
    console.error("[speak] Gemini returned no audio");
    throw new ApiError(502, "AI_BAD_OUTPUT", "Auntie lost her voice. Try again.");
  }

  // Usually "audio/L16;codec=pcm;rate=24000"; pass anything already playable straight through.
  const mimeType = audio.mimeType ?? "audio/L16";
  if (!/^audio\/(L16|pcm)/i.test(mimeType)) return { audio: `data:${mimeType};base64,${audio.data}` };
  const rate = Number(/rate=(\d+)/.exec(mimeType)?.[1]) || 24_000;
  return { audio: `data:audio/wav;base64,${toWav(Buffer.from(audio.data, "base64"), rate).toString("base64")}` };
}
