import { AuntieBao, type AuntieBaoMood } from "@/components/mascot";
import { RiskMeter } from "@/components/ui";
import type { CheckVerdict } from "@/types/check";
import type { ScamTactic, ScanResult } from "@/types/scan";
import { cn } from "@/utils";
import { PANEL } from "./VerdictDesktop";

/** The pass / warn / block looks of the transfer verdict screens. */
const LOOK: Record<CheckVerdict, { label: string; mood: AuntieBaoMood; panel: string; ring: string; chip: string }> = {
  block: { label: "Scam", mood: "alarm", panel: "bg-brick text-white", ring: "ring-white", chip: "bg-white text-night" },
  warn: { label: "Suspicious", mood: "meh", panel: "bg-sun", ring: "ring-sun", chip: "bg-white" },
  pass: { label: "Looks fine", mood: "smug", panel: "bg-mint", ring: "ring-white", chip: "bg-white" },
};

const TACTIC_LABEL: Record<ScamTactic, string> = {
  phishing: "Phishing",
  impersonation: "Impersonation",
  fake_link: "Fake link",
  urgency: "Urgency",
};

/** Auntie's verdict on a scanned message, in the same pass, warn and block colours as a held transfer. */
export function MessageVerdict({ result, className }: { result: ScanResult; className?: string }) {
  const look = LOOK[result.verdict];
  return (
    <section role={result.verdict === "pass" ? "status" : "alert"} className={cn(PANEL, "gap-[14px] px-[18px]", look.panel, className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-bold tracking-[.06em] uppercase">{look.label}</span>
        <span className="flex items-baseline gap-[4px]">
          <span className="font-display text-[40px] leading-none font-bold">{result.score}</span>
          <span className="text-[14px] font-semibold">/100</span>
        </span>
      </div>
      <RiskMeter score={result.score} middle="white" ring={look.ring} />
      <div className="flex items-center gap-[12px]">
        <span className="flex flex-none rounded-[18px] border-[2.5px] border-ink bg-cream p-[4px]">
          <AuntieBao mood={look.mood} width={60} height={56} />
        </span>
        <p className="m-0 font-display text-[17px] leading-[1.4] font-medium">{result.summary}</p>
      </div>
      {result.tactics.length > 0 && (
        <ul aria-label="Tactics spotted" className="m-0 flex list-none flex-wrap gap-[6px] p-0">
          {result.tactics.map((t) => (
            <li key={t} className={cn("rounded-full px-[11px] py-[5px] text-[13px] font-bold", look.chip)}>
              {TACTIC_LABEL[t]}
            </li>
          ))}
        </ul>
      )}
      <ul className="m-0 flex list-none flex-col gap-[4px] p-0 text-[14px] font-medium">
        {result.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </section>
  );
}
