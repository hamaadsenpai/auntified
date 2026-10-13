"use client";

import { BackHeader, Screen } from "@/components/layout";
import { Money, RiskMeter, Tag } from "@/components/ui";
import { ROUTES, withTransfer } from "@/constants";
import { formatWhen, TransferFallback, useTransferParam } from "./transfer-param";

/** The same bands the server's quick check uses. */
const THRESHOLDS = [
  { label: "Pass", min: 0, max: 39, effect: "Goes through" },
  { label: "Warn", min: 40, max: 69, effect: "Typed confirmation" },
  { label: "Block", min: 70, max: 100, effect: "Stopped" },
];

function SignalList({ title, total, items, empty }: { title: string; total: number | null; items: string[]; empty: string }) {
  return (
    <section className="flex flex-col">
      <div className="flex justify-between pb-[4px]">
        <h2 className="m-0 font-display text-[15px] font-bold">{title}</h2>
        <span className="text-[14px] font-bold">{total ?? "—"}</span>
      </div>
      {items.length === 0 ? (
        <span className="py-[8px] text-[14px] font-medium text-muted">{empty}</span>
      ) : (
        items.map((item, i) => (
          <div
            key={item}
            className={
              i < items.length - 1
                ? "flex justify-between border-b border-line py-[8px] text-[14px] font-medium"
                : "flex justify-between py-[8px] text-[14px] font-medium"
            }
          >
            <span>{item}</span>
          </div>
        ))
      )}
    </section>
  );
}

export function ScoreScreen() {
  const { transfer, missing } = useTransferParam();

  if (!transfer) return <TransferFallback missing={missing} />;

  const score = transfer.score ?? transfer.rulesScore;

  return (
    <Screen>
      <BackHeader
        backHref={withTransfer(ROUTES.PAY_BLOCKED, transfer.id)}
        title={`Why ${score}`}
        subtitle={<><Money sgd={transfer.amountSgd} /> to {transfer.payeeName}, {formatWhen(transfer.createdAt)}</>}
      />
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
        <SignalList title="Rule signals" total={transfer.rulesScore} items={transfer.flags} empty="No rule flags on this payment." />
        <SignalList title="Model flags" total={transfer.modelScore} items={transfer.reasons} empty="Auntie gave no reasons." />
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
      </main>
    </Screen>
  );
}
