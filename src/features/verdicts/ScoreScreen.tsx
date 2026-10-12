import { BackHeader, Screen } from "@/components/layout";
import { Money, RiskMeter, Tag } from "@/components/ui";
import { ROUTES } from "@/constants";

const RULES = [
  { id: "new", label: "New payee", points: "+20" },
  { id: "young", label: "Payee under 1 hour old", points: "+15" },
  { id: "p95", label: <>Above your p95 of <Money sgd={640} whole /></>, points: "+11" },
];

const FLAGS = [
  { label: "Deadline pressure", confidence: "0.91", points: "+16", quote: '"The slot closes tonight."' },
  { label: "Third party investing", confidence: "0.84", points: "+12", quote: "Friend of a friend who handles money." },
  { label: "Never met payee", confidence: "0.88", points: "+12", quote: "Answered no to meeting in person." },
];

export function ScoreScreen() {
  return (
    <Screen>
      <BackHeader backHref={ROUTES.PAY_BLOCKED} title="Why 86" subtitle={<><Money sgd={1850} /> to Kelvin Tan, 11 Oct 23:52</>} />
      <main className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto px-[20px] pb-[20px] *:shrink-0">
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-center justify-between">
            <span className="flex items-baseline gap-[2px]">
              <span className="font-display text-[40px] leading-none font-bold">86</span>
              <span className="text-[14px] font-semibold text-muted">/100</span>
            </span>
            <span className="text-[13px] font-semibold text-muted">Rules 46 + Model 40</span>
          </div>
          <RiskMeter score={86} />
        </div>
        <section className="flex flex-col">
          <div className="flex justify-between pb-[4px]">
            <h2 className="m-0 font-display text-[15px] font-bold">Rule signals</h2>
            <span className="text-[14px] font-bold">46</span>
          </div>
          {RULES.map((rule, i) => (
            <div
              key={rule.id}
              className={
                i < RULES.length - 1
                  ? "flex justify-between border-b border-line py-[8px] text-[14px] font-medium"
                  : "flex justify-between py-[8px] text-[14px] font-medium"
              }
            >
              <span>{rule.label}</span>
              <strong>{rule.points}</strong>
            </div>
          ))}
        </section>
        <section className="flex flex-col">
          <div className="flex justify-between pb-[4px]">
            <h2 className="m-0 font-display text-[15px] font-bold">Model flags</h2>
            <span className="text-[14px] font-bold">40</span>
          </div>
          {FLAGS.map((flag, i) => (
            <div
              key={flag.label}
              className={
                i < FLAGS.length - 1
                  ? "grid grid-cols-[1fr_auto_auto] gap-[2px_12px] border-b border-line py-[8px] text-[14px] font-medium"
                  : "grid grid-cols-[1fr_auto_auto] gap-[2px_12px] py-[8px] text-[14px] font-medium"
              }
            >
              <span className="font-semibold">{flag.label}</span>
              <span className="text-muted">{flag.confidence}</span>
              <strong>{flag.points}</strong>
              <span className="col-span-full text-[13px] text-muted">{flag.quote}</span>
            </div>
          ))}
        </section>
        <section className="flex flex-col gap-[6px]">
          <h2 className="m-0 mb-[2px] font-display text-[15px] font-bold">Thresholds</h2>
          <div className="flex min-h-[40px] items-center justify-between rounded-[10px] bg-wash px-[12px] text-[14px] font-medium">
            <span>
              <strong>Pass</strong> 0 to 39
            </span>
            <span className="text-muted">Goes through</span>
          </div>
          <div className="flex min-h-[40px] items-center justify-between rounded-[10px] bg-wash px-[12px] text-[14px] font-medium">
            <span>
              <strong>Warn</strong> 40 to 69
            </span>
            <span className="text-muted">Typed confirmation</span>
          </div>
          <div
            aria-current="true"
            className="flex min-h-[44px] items-center justify-between rounded-[10px] border-2 border-brick px-[12px] text-[14px] font-medium"
          >
            <span>
              <strong>Block</strong> 70 to 100
            </span>
            <Tag variant="blocked">Verdict</Tag>
          </div>
        </section>
      </main>
    </Screen>
  );
}
