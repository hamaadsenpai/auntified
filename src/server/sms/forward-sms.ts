import "server-only";
import { createHash } from "node:crypto";
import { ApiError } from "@/lib/api/errors";
import { claimDailySmsScan, getSmsScan, saveSmsScan } from "@/server/repositories/sms-scans.repository";
import { scanMessage } from "@/server/scan/scan";
import type { CheckVerdict } from "@/types/check";
import type { SmsForward, SmsForwardResult, SmsScan } from "@/types/sms";
import { maskedPreview, worthScanning } from "./text";

const ALERT_LABEL: Record<CheckVerdict, string> = { block: "🚨 Likely scam", warn: "⚠️ Suspicious", pass: "" };

/** The line the Shortcut shows, e.g. "🚨 Likely scam (85/100) from HNB-Alert: Fake bank link …". */
function notificationFor(scan: SmsScan) {
  const from = scan.sender ? ` from ${scan.sender}` : "";
  return `${ALERT_LABEL[scan.verdict]} (${scan.score}/100)${from}: ${scan.summary}`;
}

function result(scan: SmsScan, duplicate: boolean): SmsForwardResult {
  const alert = scan.verdict !== "pass";
  return { scanned: true, duplicate, alert, show: alert ? "yes" : null, notification: alert ? notificationFor(scan) : "", scan };
}

/**
 * Scam-checks a text the iPhone Shortcut forwarded, with the same Gemini scanner as /scan, and keeps
 * the verdict (with a masked preview, never the full text) for the Scan page's history.
 */
export async function forwardSms(uid: string, { message, sender }: SmsForward): Promise<SmsForwardResult> {
  const text = message.replace(/\s+/g, " ").trim();
  if (!worthScanning(text)) {
    return { scanned: false, alert: false, show: null, notification: "", reason: "No link, number or money talk to check." };
  }

  // Same text → same id: an automation that fires twice reuses the first verdict and costs nothing.
  const id = createHash("sha256").update(text).digest("hex").slice(0, 24);
  const seen = await getSmsScan(uid, id);
  if (seen) return result(seen, true);

  if (!(await claimDailySmsScan(uid))) {
    throw new ApiError(429, "DAILY_LIMIT", "Auntie has checked enough texts for today. She'll pick up again tomorrow.");
  }
  const scan = await scanMessage(uid, { text });
  const saved = await saveSmsScan(uid, id, { ...scan, sender: sender || null, preview: maskedPreview(text) });
  return result(saved, false);
}
