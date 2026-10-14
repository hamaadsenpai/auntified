import type { CheckVerdict } from "./check";

export type ScamTactic = "phishing" | "impersonation" | "fake_link" | "urgency";

/** Body of POST /api/scan: a pasted message, a screenshot (base64 without the data: prefix), or both. */
export type ScanRequest = { text?: string; image?: { mimeType: string; data: string } };

/** Response of POST /api/scan. `verdict` uses the same bands as a transfer check. */
export type ScanResult = {
  verdict: CheckVerdict;
  score: number;
  tactics: ScamTactic[];
  /** Short reasons, most important first. */
  reasons: string[];
  /** Auntie's one-sentence take and what to do, in the user's tone. */
  summary: string;
};
