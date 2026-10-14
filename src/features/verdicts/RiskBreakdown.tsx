import type { Transfer } from "@/types/transfer";
import { cn } from "@/utils";
import { formatWhen } from "./transfer-param";

const ROW = "flex justify-between gap-[12px] border-b border-line py-[8px] text-[14px] font-medium";

/**
 * Why the score is what it is: Auntie's one-line summary, each rule that fired with its points,
 * the cap, then what her questions added (with her reasons) and the total.
 */
export function RiskBreakdown({ transfer, className }: { transfer: Transfer; className?: string }) {
  const score = transfer.score ?? transfer.rulesScore;
  // Transfers from before reason codes have flags but no weights.
  const rules = transfer.signals.length
    ? transfer.signals.map((s) => ({ label: s.label, points: s.weight as number | null }))
    : transfer.flags.map((label) => ({ label, points: null }));
  const ruleTotal = transfer.signals.reduce((sum, s) => sum + s.weight, 0);

  return (
    <div className={cn("flex flex-col", className)}>
      {transfer.summary && <p className="m-0 pb-[10px] font-display text-[16px] leading-[1.4] font-medium">{transfer.summary}</p>}
      {rules.length === 0 && <span className={cn(ROW, "text-muted")}>No rule flags on this payment.</span>}
      {rules.map((r) => (
        <div key={r.label} className={ROW}>
          <span>{r.label}</span>
          {r.points !== null && <span className="flex-none font-bold">+{r.points}</span>}
        </div>
      ))}
      {ruleTotal > transfer.rulesScore && (
        <div className={cn(ROW, "text-muted")}>
          <span>Rules count up to {transfer.rulesScore}</span>
          <span className="flex-none font-bold">{transfer.rulesScore - ruleTotal}</span>
        </div>
      )}
      {transfer.modelScore !== null && (
        <div className={cn(ROW, "flex-col gap-[2px]")}>
          <span className="flex justify-between gap-[12px]">
            <span>Her questions</span>
            <span className="flex-none font-bold">+{transfer.modelScore}</span>
          </span>
          {transfer.reasons.map((reason) => (
            <span key={reason} className="text-[13px] text-muted">
              {reason}
            </span>
          ))}
        </div>
      )}
      <div className="flex justify-between pt-[8px] text-[15px] font-bold">
        <span>Risk score</span>
        <span>{score}/100</span>
      </div>
    </div>
  );
}

/** The trusted-contact alert logged on this transfer, with a ready-made text to send them. Nothing when none was logged. */
export function ContactAlertNote({ transfer, className }: { transfer: Transfer; className?: string }) {
  const alert = transfer.contactAlert;
  if (!alert) return null;
  const body = `Auntified flagged a payment I tried to make to ${transfer.payeeName}. Can you call me before I do anything?`;
  return (
    <div role="status" className={cn("flex flex-col gap-[4px] rounded-[16px] bg-wash px-[14px] py-[12px]", className)}>
      <span className="text-[14px] font-semibold">
        Alert for {alert.name} logged, {formatWhen(alert.at, ", ")}.
      </span>
      <a href={`sms:${alert.phone.replace(/[^\d+]/g, "")}?body=${encodeURIComponent(body)}`} className="flex min-h-[44px] items-center self-start text-[14px] font-semibold text-teal">
        Text {alert.name} now
      </a>
    </div>
  );
}
