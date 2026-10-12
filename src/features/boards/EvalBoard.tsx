import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils";
import { BoardLabel } from "./BoardLabel";

const STATS = [
  { label: "Scam recall", value: "95%", note: "19 of 20 caught" },
  { label: "False positive rate", value: "5%", note: "1 of 20 legit blocked" },
  { label: "Median turns to verdict", value: "3", note: "questions asked" },
  { label: "Latency per turn", value: "1.4s", note: "p50, p95 2.6s" },
];

const ROWS = [
  { id: "C03", scenario: "Investment slot, new payee", truth: "Scam", score: "86", verdict: "Block", turns: "3", result: "Correct" },
  { id: "C07", scenario: "Parcel fee link", truth: "Scam", score: "81", verdict: "Block", turns: "1", result: "Correct" },
  { id: "C12", scenario: "Rent to known landlord", truth: "Legit", score: "6", verdict: "Pass", turns: "0", result: "Correct" },
  { id: "C19", scenario: "Late night split with a friend", truth: "Legit", score: "54", verdict: "Warn", turns: "2", result: "Correct" },
  { id: "C31", scenario: "First rent to a new landlord", truth: "Legit", score: "72", verdict: "Block", turns: "4", result: "False positive", flag: true },
  { id: "C38", scenario: "Impersonation via a known payee", truth: "Scam", score: "34", verdict: "Pass", turns: "0", result: "Missed", flag: true },
];

const TH = "py-[8px] font-bold border-b-[1.5px] border-night";

export function EvalBoard() {
  return (
    <div id="s15" className="flex flex-col gap-[10px]">
      <BoardLabel href={ROUTES.EVAL} num="15">
        Eval results
      </BoardLabel>
      <div className="flex h-[620px] w-[1000px] flex-col gap-[24px] overflow-hidden rounded-[20px] border-[3px] border-ink bg-white p-[32px] shadow-hard-lg">
        <div className="flex items-baseline justify-between">
          <h1 className="m-0 font-display text-[26px] leading-[1.1] font-bold">Eval results</h1>
          <span className="text-[13px] font-medium text-muted">40 case replay, 20 scam and 20 legit. Run 11 Oct 2026.</span>
        </div>
        <div className="grid grid-cols-[repeat(4,1fr)] gap-[14px]">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-[4px] rounded-[20px] border-[2.5px] border-ink p-[16px] shadow-hard-sm"
            >
              <span className="text-[13px] font-medium text-muted">{s.label}</span>
              <span className="font-display text-[40px] leading-none font-bold">{s.value}</span>
              <span className="text-[13px] font-medium text-muted">{s.note}</span>
            </div>
          ))}
        </div>
        <table className="w-full border-collapse text-[14px] font-medium">
          <thead>
            <tr className="text-left text-[12px] tracking-[.06em] text-muted uppercase">
              <th className={TH}>Case</th>
              <th className={TH}>Scenario</th>
              <th className={TH}>Truth</th>
              <th className={cn(TH, "text-right")}>Score</th>
              <th className={cn(TH, "pl-[24px]")}>Verdict</th>
              <th className={cn(TH, "text-right")}>Turns</th>
              <th className={cn(TH, "pl-[24px]")}>Result</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => {
              const td = cn("py-[10px]", i < ROWS.length - 1 && "border-b border-line");
              return (
                <tr key={r.id} className={cn(r.flag && "bg-wash")}>
                  <td className={cn(td, r.flag && "pl-[8px]", "font-mono text-[13px]")}>{r.id}</td>
                  <td className={td}>{r.scenario}</td>
                  <td className={td}>{r.truth}</td>
                  <td className={cn(td, "text-right font-display text-[15px] font-bold")}>{r.score}</td>
                  <td className={cn(td, "pl-[24px]")}>{r.verdict}</td>
                  <td className={cn(td, "text-right")}>{r.turns}</td>
                  <td className={cn(td, "pl-[24px]", r.flag && "font-bold")}>{r.result}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
