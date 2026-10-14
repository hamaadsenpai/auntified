"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, Money } from "@/components/ui";
import { ROUTES } from "@/constants";
import { findRecurring } from "@/features/roast/cuts";
import { byCategory, formatDay, formatTime, inRange, sumSgd, useNow, weekWindow, weeklyNormal } from "@/features/roast/week";
import { useExpenses, useExpensesStore, usePayees, useTransfers, useTransfersStore } from "@/store";
import type { TransferStatus } from "@/types/transfer";
import { cn } from "@/utils";
import { coverageGaps, type CoverageGap } from "./coverage";

const SENT: TransferStatus[] = ["passed", "overridden"];
/** Fewer than this and a median or an hour range says nothing. */
const MIN_TRANSFERS = 3;
const HOT_RATIO = 1.5;

type Variant = "mobile" | "desktop";

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

/** Transfer amounts, transacting hours and this week's spending against normal. Shared by the mobile and desktop screens. */
export function usePatterns() {
  const transfers = useTransfers();
  const expenses = useExpenses();
  const payees = usePayees();
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
    const week = expenses.items.filter((e) => inRange(e, start, end));
    const { perCategory: normal, totalSgd: normalTotal, weeks: normalWeeks } = weeklyNormal(expenses.items, start);
    const rows = byCategory(week).map((c) => ({ name: c.category, week: c.totalSgd, normal: normal.get(c.category) ?? 0 }));
    // Categories with a normal but nothing this week still belong in the comparison.
    for (const [name, value] of normal) if (!rows.some((r) => r.name === name)) rows.push({ name, week: 0, normal: value });
    const max = Math.max(0, ...rows.flatMap((r) => [r.week, r.normal]));
    return { rows, max, normalWeeks, ratio: normalTotal > 0 ? sumSgd(week) / normalTotal : null };
  }, [expenses.items, now]);

  const recurring = useMemo(() => (now ? findRecurring(expenses.items, now) : []), [expenses.items, now]);
  const coverage = useMemo(
    () => (now ? coverageGaps(expenses.items, transfers.items, payees.items, now) : []),
    [expenses.items, transfers.items, payees.items, now],
  );

  return {
    transfers,
    expenses,
    amounts,
    recurring,
    coverage,
    coverageReady: expenses.status === "ready" && transfers.status === "ready" && payees.status === "ready" && now !== null,
    hours,
    weeks,
    transfersReady: transfers.status === "ready",
    expensesReady: expenses.status === "ready" && weeks !== null,
    retryTransfers: () => void useTransfersStore.getState().load(true),
    retryExpenses: () => void useExpensesStore.getState().load(true),
  };
}

type Patterns = ReturnType<typeof usePatterns>;
type PartProps = { p: Patterns; variant?: Variant };

export function AmountCards({ p, variant = "mobile" }: PartProps) {
  const desktop = variant === "desktop";
  const card = desktop ? "flex flex-col gap-[4px] rounded-[22px] px-[24px] py-[20px] shadow-hard-md" : "flex flex-col gap-[2px] p-[12px]";
  const label = desktop ? "text-[13px] font-medium text-muted" : "text-[12px] font-medium text-muted";
  const value = cn("font-display leading-[1.1] font-bold", desktop ? "text-[34px]" : "text-[26px]");
  if (!p.transfersReady) return <Status error={p.transfers.error} onRetry={p.retryTransfers} />;
  if (!p.amounts) {
    return (
      <p className="m-0 text-[14px] font-medium text-muted">
        Send at least {MIN_TRANSFERS} transfers from Pay and Auntie will learn your usual amounts.
      </p>
    );
  }
  return (
    <div className={cn("grid grid-cols-2", desktop ? "gap-[16px]" : "gap-[10px]")}>
      <Card className={card}>
        <span className={label}>Median transfer</span>
        <span className={value}><Money sgd={p.amounts.median} whole /></span>
      </Card>
      <Card className={card}>
        <span className={label}>p95 transfer</span>
        <span className={value}><Money sgd={p.amounts.p95} whole /></span>
      </Card>
    </div>
  );
}

export function UsualHours({ p, variant = "mobile" }: PartProps) {
  const { hours } = p;
  return (
    <div className={cn("flex flex-col", variant === "desktop" ? "gap-[14px]" : "gap-[8px]")}>
      <div className="flex items-baseline justify-between">
        <h2 className={cn("m-0 font-display font-bold", variant === "desktop" ? "text-[17px]" : "text-[16px]")}>Usual hours</h2>
        {hours && (
          <span className="text-[14px] font-semibold">
            {hourLabel(hours.from)} to {hourLabel(hours.to)}
          </span>
        )}
      </div>
      {!p.transfersReady ? (
        <Status error={p.transfers.error} onRetry={p.retryTransfers} />
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
  );
}

export function WeekVsNormal({ p, variant = "mobile" }: PartProps) {
  const { weeks } = p;
  return (
    <div className={cn("flex flex-col", variant === "desktop" ? "gap-[18px]" : "gap-[14px]")}>
      <div className="flex items-baseline justify-between">
        <h2 className={cn("m-0 font-display font-bold", variant === "desktop" ? "text-[17px]" : "text-[16px]")}>This week vs normal</h2>
        <span className="flex gap-[10px] text-[12px] font-medium text-muted">
          <span className="flex items-center gap-[4px]">
            <span className="h-[10px] w-[10px] rounded-[2px] bg-teal"></span>Week
          </span>
          <span className="flex items-center gap-[4px]">
            <span className="h-[10px] w-[10px] rounded-[2px] bg-mint"></span>Normal
          </span>
        </span>
      </div>
      {!p.expensesReady || !weeks ? (
        <Status error={p.expenses.error} onRetry={p.retryExpenses} />
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
  );
}

export function HotWeek({ p }: { p: Patterns }) {
  const ratio = p.weeks?.ratio;
  if (!p.expensesReady || !p.weeks || ratio == null || ratio < HOT_RATIO) return null;
  return (
    <div className="flex flex-col gap-[4px] rounded-[16px] border-[1.5px] border-night px-[16px] py-[14px]">
      <span className="font-display text-[15px] font-bold">This week ran hot</span>
      <span className="text-[14px] leading-[1.4] font-medium text-muted">
        Spending is {ratio.toFixed(1)}x your average week over the last {p.weeks.normalWeeks === 1 ? "week" : `${p.weeks.normalWeeks} weeks`}.
      </span>
    </div>
  );
}

function Heading({ variant, children }: { variant: Variant; children: React.ReactNode }) {
  return <h2 className={cn("m-0 font-display font-bold", variant === "desktop" ? "text-[17px]" : "text-[16px]")}>{children}</h2>;
}

/** Bills and subscriptions that keep charging, from logged spending and imported statements. */
export function RecurringCharges({ p, variant = "mobile" }: PartProps) {
  const monthly = p.recurring.reduce((sum, r) => sum + r.monthlySgd, 0);
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-baseline justify-between">
        <Heading variant={variant}>Recurring bills and subscriptions</Heading>
        {p.recurring.length > 0 && (
          <span className="text-[14px] font-semibold">
            <Money sgd={monthly} whole /> a month
          </span>
        )}
      </div>
      {!p.expensesReady ? (
        <Status error={p.expenses.error} onRetry={p.retryExpenses} />
      ) : p.recurring.length === 0 ? (
        <p className="m-0 text-[14px] font-medium text-muted">
          None spotted yet. Upload a bank statement on the{" "}
          <Link href={ROUTES.ROAST} className="font-semibold text-teal">
            weekly roast
          </Link>{" "}
          and Auntie will find them.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col border-t border-line p-0">
          {p.recurring.map((r) => (
            <li key={r.name.toLowerCase()} className="grid grid-cols-[1fr_auto] gap-x-[12px] border-b border-line py-[8px] text-[14px] font-medium">
              <span className="font-semibold">{r.name}</span>
              <Money sgd={r.monthlySgd} />
              <span className="text-[13px] text-muted">
                {r.category} · last {formatDay(new Date(r.lastAt))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GapText({ gap }: { gap: CoverageGap }) {
  if (gap.kind === "hospital") return <>No insurance premiums show up in your spending. Check you&apos;re covered for a hospital stay beyond the basics.</>;
  if (gap.kind === "accident") {
    return (
      <>
        You spend about <Money sgd={gap.monthlySgd} whole /> a month on rides. Personal accident cover pays out for injuries on the road.
      </>
    );
  }
  return (
    <>
      You send family about <Money sgd={gap.monthlySgd} whole /> a month, mostly to {gap.payee}. Term life cover keeps that going if you can&apos;t.
    </>
  );
}

const GAP_TITLE: Record<CoverageGap["kind"], string> = { hospital: "Hospital cover", accident: "Personal accident", life: "Life cover" };

/** Insurance lite: where the user's spending says they may be under-covered. */
export function CoverageCheck({ p, variant = "mobile" }: PartProps) {
  return (
    <div className="flex flex-col gap-[10px]">
      <Heading variant={variant}>Coverage check</Heading>
      {!p.coverageReady ? (
        <p className="m-0 text-[14px] font-medium text-muted">Loading…</p>
      ) : p.coverage.length === 0 ? (
        <p className="m-0 text-[14px] font-medium text-muted">No gaps spotted from your spending.</p>
      ) : (
        p.coverage.map((gap) => (
          <div key={gap.kind} className="flex flex-col gap-[4px] rounded-[16px] border-[1.5px] border-night px-[16px] py-[14px]">
            <span className="font-display text-[15px] font-bold">You&apos;re under-covered for {GAP_TITLE[gap.kind].toLowerCase()}</span>
            <span className="text-[14px] leading-[1.4] font-medium text-muted">
              <GapText gap={gap} />
            </span>
          </div>
        ))
      )}
      <span className="text-[12px] font-medium text-muted">From your spending here only. Not financial advice.</span>
    </div>
  );
}
