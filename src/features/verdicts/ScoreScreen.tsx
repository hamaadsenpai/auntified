"use client";

import { BackHeader, Screen } from "@/components/layout";
import { Money, RiskMeter, Tag } from "@/components/ui";
import { ROUTES, withTransfer } from "@/constants";
import { RiskBreakdown } from "./RiskBreakdown";
import { formatWhen, TransferFallback, useTransferParam } from "./transfer-param";
import { PANEL, VerdictDesktop } from "./VerdictDesktop";

/** The same bands the server's quick check uses. */
const THRESHOLDS = [
  { label: "Pass", min: 0, max: 39, effect: "Goes through" },
  { label: "Warn", min: 40, max: 69, effect: "Typed confirmation" },
  { label: "Block", min: 70, max: 100, effect: "Stopped" },
];

export function ScoreScreen() {
  const { transfer, missing } = useTransferParam();

  if (!transfer) return <TransferFallback missing={missing} />;

  const score = transfer.score ?? transfer.rulesScore;

  const subtitle = (
    <>
      <Money sgd={transfer.amountSgd} /> to {transfer.payeeName}, {formatWhen(transfer.createdAt)}
    </>
  );
  const backHref = withTransfer(ROUTES.PAY_BLOCKED, transfer.id);

  return (
    <>
      <VerdictDesktop back={{ href: backHref, label: "Back to the block" }} kicker={subtitle} title={`Why ${score}`}>
        <div className="grid grid-cols-[minmax(0,360px)_minmax(0,1fr)] items-start gap-[24px]">
          <section aria-labelledby="dscore-h" className={`${PANEL} gap-[16px]`}>
            <h2 id="dscore-h" className="m-0 font-display text-[17px] font-bold">
              Risk score
            </h2>
            <span className="flex items-baseline gap-[4px]">
              <span className="font-display text-[72px] leading-none font-bold">{score}</span>
              <span className="text-[18px] font-semibold text-muted">/100</span>
            </span>
            <RiskMeter score={score} height={14} radius={7} markerHeight={22} />
            <div className="grid grid-cols-2 gap-[10px]">
              <div className="flex flex-col gap-[2px] rounded-[14px] border border-line-strong p-[12px]">
                <span className="text-[12px] font-medium text-muted">Rules</span>
                <span className="font-display text-[24px] font-bold">{transfer.rulesScore}</span>
              </div>
              <div className="flex flex-col gap-[2px] rounded-[14px] border border-line-strong p-[12px]">
                <span className="text-[12px] font-medium text-muted">Model</span>
                <span className="font-display text-[24px] font-bold">{transfer.modelScore ?? "—"}</span>
              </div>
            </div>
            <Thresholds score={score} />
          </section>
          <section aria-labelledby="dwhy-h" className={`${PANEL} gap-[8px]`}>
            <h2 id="dwhy-h" className="m-0 font-display text-[17px] font-bold">
              What added up
            </h2>
            <RiskBreakdown transfer={transfer} />
          </section>
        </div>
      </VerdictDesktop>
      <Screen className="lg:hidden">
        <BackHeader backHref={backHref} title={`Why ${score}`} subtitle={subtitle} />
        <main className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto px-[20px] pb-[20px] *:shrink-0">
          <div className="flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="flex items-baseline gap-[2px]">
                <span className="font-display text-[40px] leading-none font-bold">{score}</span>
                <span className="text-[14px] font-semibold text-muted">/100</span>
              </span>
              <span className="text-[13px] font-semibold text-muted">
                Rules {transfer.rulesScore} + Model {transfer.modelScore ?? "—"}
              </span>
            </div>
            <RiskMeter score={score} />
          </div>
          <section className="flex flex-col gap-[4px]">
            <h2 className="m-0 font-display text-[15px] font-bold">What added up</h2>
            <RiskBreakdown transfer={transfer} />
          </section>
          <Thresholds score={score} />
        </main>
      </Screen>
    </>
  );
}

function Thresholds({ score }: { score: number }) {
  return (
    <section className="flex flex-col gap-[6px]">
      <h2 className="m-0 mb-[2px] font-display text-[15px] font-bold">Thresholds</h2>
      {THRESHOLDS.map((band) =>
        score >= band.min && score <= band.max ? (
          <div
            key={band.label}
            aria-current="true"
            className="flex min-h-[44px] items-center justify-between rounded-[10px] border-2 border-brick px-[12px] text-[14px] font-medium"
          >
            <span>
              <strong>{band.label}</strong> {band.min} to {band.max}
            </span>
            <Tag variant="blocked">Verdict</Tag>
          </div>
        ) : (
          <div key={band.label} className="flex min-h-[40px] items-center justify-between rounded-[10px] bg-wash px-[12px] text-[14px] font-medium">
            <span>
              <strong>{band.label}</strong> {band.min} to {band.max}
            </span>
            <span className="text-muted">{band.effect}</span>
          </div>
        ),
      )}
    </section>
  );
}
