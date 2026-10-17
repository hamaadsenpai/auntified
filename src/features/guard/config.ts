import { Type, type Tool } from "@google/genai";
import { z } from "zod";
import { AUNTIE_ACCENT } from "@/constants/voice";

// Voice-call tactics; the repo's ScamTactic is SMS-only (no OTP/remote-access/gift-card), so not reused.
const TACTICS = ["impersonation", "urgency", "otp_request", "remote_access", "safe_account", "gift_card_crypto", "prize"];

export const GUARD_SYSTEM_PROMPT = `You are Auntie Kumari, a sharp, caring Sri Lankan auntie. The user has put a phone call on speaker and you are listening in to protect them.

After each thing the caller says, call the rate_call tool with a scam risk from 0 (clearly normal) to 100 (clearly a scam) and a short reason. Do this silently; calling the tool is not speaking.

While the call sounds normal, stay completely silent. Say nothing at all.

Only when you hear scam tactics, such as someone pretending to be a bank, police or official, pressure or urgency, requests for an OTP, PIN or password, remote-access or "safe account" transfers, gift cards or crypto, or surprise prizes:
1. Call the flag_scam tool with the tactic type, your confidence from 0 to 1, and the exact quote you heard.
2. Then warn the user out loud in one or two short sentences, in a warm, brisk, slightly cheeky voice (${AUNTIE_ACCENT}), and tell them to hang up. Plainly call the caller a "fraud" or "fraudster", for example "This caller is a fraud. Hang up now." Never say "naughty".

Never introduce yourself or say your own name. Never speak to the caller. Speak only to the user.`;

export const GUARD_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "flag_scam",
        description: "Flag a scam tactic heard on the call.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: TACTICS, description: "The scam tactic heard." },
            confidence: { type: Type.NUMBER, description: "Confidence from 0 to 1." },
            quote: { type: Type.STRING, description: "The exact words heard." },
          },
          required: ["type", "confidence", "quote"],
        },
      },
      {
        name: "rate_call",
        description: "Rate how likely the call so far is a scam. Call after each thing the caller says.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            risk: { type: Type.NUMBER, description: "Scam risk from 0 to 100." },
            reason: { type: Type.STRING, description: "One short sentence on why." },
          },
          required: ["risk", "reason"],
        },
      },
    ],
  },
];

const flagSchema = z.object({ type: z.string(), confidence: z.number(), quote: z.string() });

export type ScamFlag = z.infer<typeof flagSchema>;

export function parseFlag(args: unknown): ScamFlag | null {
  const r = flagSchema.safeParse(args);
  return r.success ? r.data : null;
}

const ratingSchema = z.object({ risk: z.number(), reason: z.string() });

export type CallRating = z.infer<typeof ratingSchema>;

export function parseRating(args: unknown): CallRating | null {
  const r = ratingSchema.safeParse(args);
  return r.success ? r.data : null;
}
