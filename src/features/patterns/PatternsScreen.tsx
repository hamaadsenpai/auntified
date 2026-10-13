"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BackHeader, Screen } from "@/components/layout";
import { Card, Money } from "@/components/ui";
import { ROUTES } from "@/constants";
import { byCategory, DAY_MS, formatTime, inRange, sumSgd, useNow, weekWindow } from "@/features/roast/week";
import { useExpenses, useExpensesStore, useTransfers, useTransfersStore } from "@/store";
import type { TransferStatus } from "@/types/transfer";

const SENT: TransferStatus[] = ["passed", "overridden"];
/** Fewer than this and a median or an hour range says nothing. */
const MIN_TRANSFERS = 3;
/** "Normal" is the average week over this many weeks before this one. */
const NORMAL_WEEKS = 12;
const HOT_RATIO = 1.5;

/** Linear-interpolated percentile (0 to 1) of an ascending list. */
function percentile(sorted: number[], p: number): number {
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

const hourOfDay = (iso: string) => {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
};

/** 8 → "8am", 22 → "10pm", 0 and 24 → "12am". */
function hourLabel(hour: number): string {
  const h = Math.round(hour) % 24;
  return `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;
}

const pct = (hour: number) => `${(hour / 24) * 100}%`;

function Status({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return error ? (
    <div className="flex flex-col items-start gap-[4px]">
      <p role="alert" className="m-0 text-[14px] font-semibold text-brick">
        {error}
      </p>
      <button type="button" onClick={onRetry} className="min-h-[44px] cursor-pointer border-none bg-transparent p-0 text-[14px] font-semibold text-teal">
        Try again
      </button>
    </div>
  ) : (
    <p className="m-0 text-[14px] font-medium text-muted">Loading…</p>
  );
}

export function PatternsScreen() {
  const transfers = useTransfers();
  const expenses = useExpenses();
  const now = useNow();

  const amounts = useMemo(() => {
    const sent = transfers.items.filter((t) => SENT.includes(t.status)).map((t) => t.amountSgd);
    if (sent.length < MIN_TRANSFERS) return null;
    sent.sort((a, b) => a - b);
    return { median: percentile(sent, 0.5), p95: percentile(sent, 0.95) };
  }, [transfers.items]);

  const hours = useMemo(() => {
    if (transfers.items.length < MIN_TRANSFERS) return null;
    const sorted = transfers.items.map((t) => hourOfDay(t.createdAt)).sort((a, b) => a - b);
    const latest = transfers.items.reduce((a, b) => (Date.parse(b.createdAt) > Date.parse(a.createdAt) ? b : a));
    return { from: percentile(sorted, 0.1), to: percentile(sorted, 0.9), latest: new Date(latest.createdAt), latestHour: hourOfDay(latest.createdAt) };
  }, [transfers.items]);

  const weeks = useMemo(() => {
    if (!now) return null;
    const { start, end } = weekWindow(now);
    const before = new Date(start.getTime() - NORMAL_WEEKS * 7 * DAY_MS);
    const week = expenses.items.filter((e) => inRange(e, start, end));
    const past = expenses.items.filter((e) => inRange(e, before, start));
    const normal = new Map(byCategory(past).map((c) => [c.category, c.totalSgd / NORMAL_WEEKS]));
    const rows = byCategory(week).map((c) => ({ name: c.category, week: c.totalSgd, normal: normal.get(c.category) ?? 0 }));
    // Categories with a normal but nothing this week still belong in the comparison.
    for (const [name, value] of normal) if (!rows.some((r) => r.name === name)) rows.push({ name, week: 0, normal: value });
    const max = Math.max(0, ...rows.flatMap((r) => [r.week, r.normal]));
    const normalTotal = sumSgd(past) / NORMAL_WEEKS;
    return { rows, max, ratio: normalTotal > 0 ? sumSgd(week) / normalTotal : null };
  }, [expenses.items, now]);

  const transfersReady = transfers.status === "ready";
  const expensesReady = expenses.status === "ready" && weeks !== null;
  const retryTransfers = () => void useTransfersStore.getState().load(true);
  const retryExpenses = () => void useExpensesStore.getState().load(true);

  return (
    <Screen>
      <BackHeader backHref={ROUTES.SETTINGS} title="Your patterns" subtitle="What she scores you against." />
      <main className="flex min-h-0 flex-1 flex-col gap-[22px] overflow-y-auto px-[20px] pt-[8px] pb-[24px] *:shrink-0">
        {!transfersReady ? (
          <Status error={transfers.error} onRetry={retryTransfers} />
        ) : amounts ? (
          <div className="grid grid-cols-2 gap-[10px]">
            <Card className="flex flex-col gap-[2px] p-[12px]">
              <span className="text-[12px] font-medium text-muted">Median transfer</span>
              <span className="font-display text-[26px] leading-[1.1] font-bold"><Money sgd={amounts.median} whole /></span>
            </Card>
            <Card className="flex flex-col gap-[2px] p-[12px]">
              <span className="text-[12px] font-medium text-muted">p95 transfer</span>
              <span className="font-display text-[26px] leading-[1.1] font-bold"><Money sgd={amounts.p95} whole /></span>
            </Card>
          </div>
        ) : (
          <p className="m-0 text-[14px] font-medium text-muted">
            Send at least {MIN_TRANSFERS} transfers from Pay and Auntie will learn your usual amounts.
          </p>
        )}
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-baseline justify-between">
            <h2 className="m-0 font-display text-[16px] font-bold">Usual hours</h2>
            {hours && (
              <span className="text-[14px] font-semibold">
                {hourLabel(hours.from)} to {hourLabel(hours.to)}
              </span>
            )}
          </div>
          {!transfersReady ? (
            <Status error={transfers.error} onRetry={retryTransfers} />
          ) : hours ? (
            <>
              <div
                aria-label={`Usual transacting hours, ${hourLabel(hours.from)} to ${hourLabel(hours.to)}`}
                role="img"
                className="relative flex h-[28px] rounded-[8px] bg-track"
              >
                <span
                  className="absolute top-0 bottom-0 rounded-[4px] bg-sea"
                  style={{ left: pct(hours.from), width: pct(hours.to - hours.from) }}
                ></span>
                <span
                  className="absolute top-[-4px] bottom-[-4px] w-[3px] rounded-[2px] bg-night"
                  style={{ left: `min(${pct(hours.latestHour)}, calc(100% - 3px))` }}
                ></span>
              </div>
              <div className="flex justify-between text-[12px] font-medium text-muted">
                <span>12am</span>
                <span>6am</span>
                <span>12pm</span>
                <span>6pm</span>
                <span className="font-bold text-night">{formatTime(hours.latest)} latest</span>
              </div>
            </>
          ) : (
            <p className="m-0 text-[14px] font-medium text-muted">After a few transfers, Auntie will show when you usually pay.</p>
          )}
        </div>
        <div className="flex flex-col gap-[14px]">
          <div className="flex items-baseline justify-between">
            <h2 className="m-0 font-display text-[16px] font-bold">This week vs normal</h2>
            <span className="flex gap-[10px] text-[12px] font-medium text-muted">
              <span className="flex items-center gap-[4px]">
                <span className="h-[10px] w-[10px] rounded-[2px] bg-teal"></span>Week
              </span>
              <span className="flex items-center gap-[4px]">
                <span className="h-[10px] w-[10px] rounded-[2px] bg-mint"></span>Normal
              </span>
            </span>
          </div>
          {!expensesReady ? (
            <Status error={expenses.error} onRetry={retryExpenses} />
          ) : weeks.rows.length === 0 ? (
            <p className="m-0 text-[14px] font-medium text-muted">
              Log your spending on the{" "}
              <Link href={ROUTES.ROAST} className="font-semibold text-teal">
                weekly roast
              </Link>{" "}
              and Auntie will compare your weeks here.
            </p>
          ) : (
            weeks.rows.map((c) => (
              <div key={c.name} className="flex flex-col gap-[5px]">
                <div className="flex justify-between text-[14px] font-semibold">
                  <span>{c.name}</span>
                  <span>
                    <Money sgd={c.week} /> <span className="font-medium text-muted">vs <Money sgd={c.normal} whole /></span>
                  </span>
                </div>
                <div className="flex h-[8px]">
                  <span className="rounded-[4px] bg-teal" style={{ width: `${(c.week / weeks.max) * 100}%` }}></span>
                </div>
                <div className="flex h-[8px]">
                  <span className="rounded-[4px] bg-mint" style={{ width: `${(c.normal / weeks.max) * 100}%` }}></span>
                </div>
              </div>
            ))
          )}
        </div>
        {expensesReady && weeks.ratio !== null && weeks.ratio >= HOT_RATIO && (
          <div className="flex flex-col gap-[4px] rounded-[16px] border-[1.5px] border-night px-[16px] py-[14px]">
            <span className="font-display text-[15px] font-bold">This week ran hot</span>
            <span className="text-[14px] leading-[1.4] font-medium text-muted">
              Spending is {weeks.ratio.toFixed(1)}x your average week over the last {NORMAL_WEEKS} weeks.
            </span>
          </div>
        )}
      </main>
    </Screen>
  );
}
