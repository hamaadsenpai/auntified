import type { ScanResult } from "./scan";

/** Whether the user has an SMS import key. The key itself is only shown once, when it is created. */
export type SmsKeyStatus = {
  active: boolean;
  createdAt: string | null;
  lastUsedAt: string | null;
};

/** Response of POST /api/me/sms-key: the new key, shown once. Any older key stops working. */
export type CreatedSmsKey = SmsKeyStatus & { key: string };

/** Body of POST /api/sms, sent by the iPhone Shortcut. */
export type SmsForward = { message: string; sender?: string };

/** `users/{uid}/smsScans/{id}`: a forwarded text and Auntie's scam read of it. */
export type SmsScan = ScanResult & {
  id: string;
  sender: string | null;
  /** The start of the text, with codes and card or account numbers masked. Never the full SMS. */
  preview: string;
  receivedAt: string;
};

/**
 * Response of POST /api/sms. Shaped for the Shortcut: it shows `notification` when `show` "has any value".
 * `show` is null when there's nothing to say, since that check is the one that imports cleanly into
 * Shortcuts. Error replies carry `show` and `notification` too.
 */
export type SmsForwardResult =
  | { scanned: true; duplicate: boolean; alert: boolean; show: "yes" | null; notification: string; scan: SmsScan }
  | { scanned: false; alert: false; show: null; notification: ""; reason: string };
