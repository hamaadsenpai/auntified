/** One line of Auntie's quick check, in the order it was said. */
export type CheckTurn = { role: "auntie" | "user"; text: string };

export type CheckVerdict = "pass" | "warn" | "block";

export type RiskCode = "new_payee" | "first_transfer" | "large_amount" | "scam_reports" | "odd_hour" | "urgency_words" | "over_balance";

/** A rule that fired on a transfer: what it found and the points it added to the score. */
export type RiskSignal = { code: RiskCode; label: string; weight: number };

/** Body of POST /api/pay/check: the held transfer and the conversation so far (empty to get the first question). */
export type CheckRequest = { transferId: string; transcript: CheckTurn[] };

/** Response of POST /api/pay/check. `score` = `rulesScore` + `modelScore`, capped at 100. */
export type CheckResult = {
  /** Auntie's next question, or her closing line when `done`. */
  reply: string;
  done: boolean;
  /** 1-based number of the question in `reply`; equals `maxQuestions` on the last one. */
  question: number;
  maxQuestions: number;
  rulesScore: number;
  modelScore: number;
  score: number;
  verdict: CheckVerdict;
  /** Short reasons for the score, most important first. */
  reasons: string[];
  /** Rule flags raised on the transfer before Auntie asked anything. */
  flags: string[];
  /** The same flags with their reason codes and weights. */
  signals: RiskSignal[];
  /** Once `done`: one plain sentence summing up the reasons, in the user's tone. Null before. */
  summary: string | null;
};
