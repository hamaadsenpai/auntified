/** One line of Auntie's quick check, in the order it was said. */
export type CheckTurn = { role: "auntie" | "user"; text: string };

export type CheckVerdict = "pass" | "warn" | "block";

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
};
