import "server-only";

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var ${key}. Add it to .env.local.`);
  return value;
}

// Server-only secrets. Never prefix these with NEXT_PUBLIC_.
export const env = {
  FIREBASE_PROJECT_ID: required("FIREBASE_PROJECT_ID"),
  FIREBASE_CLIENT_EMAIL: required("FIREBASE_CLIENT_EMAIL"),
  // .env files store the key with literal "\n"; the SDK needs real newlines.
  FIREBASE_PRIVATE_KEY: required("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
  GEMINI_API_KEY: required("GEMINI_API_KEY"),
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.8-flash",
  // Used when the main model is overloaded (503/429).
  // Text-to-speech for Auntie's voice (POST /api/speak).
  GEMINI_TTS_MODEL: process.env.GEMINI_TTS_MODEL || "gemini-3.8-flash-tts",
  // Live (native audio) model for the call guard (POST /api/guard/token).
  GEMINI_LIVE_MODEL: process.env.GEMINI_LIVE_MODEL || "gemini-3.8-live",
  GEMINI_FALLBACK_MODEL: process.env.GEMINI_FALLBACK_MODEL || "gemini-3.6-flash",
  // Comma-separated emails allowed into the bank analyst queue outside demo mode.
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean),
};
