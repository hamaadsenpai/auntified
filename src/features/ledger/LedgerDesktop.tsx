"use client";

import Link from "next/link";
import { AuntieBao } from "@/components/mascot";
import { Card, Chip, Money, Tag } from "@/components/ui";
import { cn } from "@/utils";
import { FILTERS, type Filter, useLedger } from "./entries";
import { formatDay, formatTime } from "./history";
import { DeleteButton, FILTER_ACTIVE, LedgerEmpty, LedgerStatus } from "./LedgerScreen";

const CARD = "flex flex-col gap-[4px] rounded-[22px] px-[24px] py-[20px] shadow-hard-md";
const TH = "border-b-[1.5px] border-line-strong px-[12px] pb-[10px] text-left text-[12px] font-bold tracking-[0.04em] text-muted uppercase";
const TD = "border-b border-line px-[12px] py-[14px]";

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function LedgerDesktop() {
  const ledger = useLedger();
  const { entries, summary: s } = ledger;
  const ready = ledger.status === "ready";
  return (
    <main className="hidden min-h-dvh min-w-0 flex-col gap-[24px] bg-white px-[40px] py-[32px] lg:flex">
      <header className="flex flex-col gap-[2px]">
        <span className="text-[13px] font-medium text-muted">{ready ? s.range : " "}</span>
        <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">History</h1>
      </header>
      <div className="grid grid-cols-3 gap-[16px]">
        <Card className={CARD}>
          <div className="flex justify-between gap-[8px]">
            <div className="flex flex-col gap-[4px]">
              <span className="text-[13px] font-medium text-muted">Scams blocked</span>
              <span className="font-display text-[34px] leading-[1.1] font-bold">{ready ? s.blockedCount : "–"}</span>
              <span className="text-[13px] font-medium text-muted">{ready ? <><Money sgd={s.keptSgd} /> kept</> : "Loading…"}</span>
            </div>
            <AuntieBao mood="smug" width={60} height={56} />
          </div>
        </Card>
        <Card className={CARD}>
          <span className="text-[13px] font-medium text-muted">Payments checked</span>
          <span className="font-display text-[34px] leading-[1.1] font-bold">{ready ? s.checkedCount : "–"}</span>
          <span className="text-[13px] font-medium text-muted">
            {ready ? `${s.passedCount} passed, ${s.overriddenCount} overridden` : "Loading…"}
          </span>
        </Card>
        <Card className={CARD}>
          <span className="text-[13px] font-medium text-muted">Leaked to habits</span>
          <span className="font-display text-[34px] leading-[1.1] font-bold">{ready ? <Money sgd={s.leakedSgd} /> : "–"}</span>
          <span className="text-[13px] font-medium text-muted">{ready ? `across ${plural(s.roastCount, "weekly roast")}` : "Loading…"}</span>
        </Card>
      </div>
      <section aria-labelledby="dlog-h" className="flex flex-col gap-[16px] rounded-[24px] border-[2.5px] border-ink px-[24px] py-[20px] shadow-hard-md">
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <div className="flex flex-col gap-[2px]">
            <h2 id="dlog-h" className="m-0 font-display text-[17px] font-bold">
              Every roast, verdict and credit
            </h2>
            <span className="text-[13px] font-medium text-muted">Newest first</span>
          </div>
          <div role="group" aria-label="Filter" className="flex gap-[8px]">
            {(["All", ...FILTERS] as Filter[]).map((f) => (
              <Chip key={f} aria-pressed={ledger.filter === f} onClick={() => ledger.setFilter(f)} className={cn(ledger.filter === f && FILTER_ACTIVE)}>
                {f}
              </Chip>
            ))}
          </div>
        </div>
        {ledger.deleteError && (
          <p role="alert" className="m-0 rounded-[14px] border-[1.5px] border-brick px-[14px] py-[10px] text-[14px] font-semibold text-brick">
            {ledger.deleteError}
          </p>
        )}
        {!ready ? (
          <LedgerStatus status={ledger.status === "error" ? "error" : "loading"} error={ledger.error} retry={ledger.retry} />
        ) : entries.length === 0 ? (
          <LedgerEmpty hasAny={ledger.hasAny} />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th scope="col" className={TH}>When</th>
                <th scope="col" className={TH}>What</th>
                <th scope="col" className={cn(TH, "text-right")}>Amount</th>
                <th scope="col" className={cn(TH, "text-right")}>Risk score</th>
                <th scope="col" className={cn(TH, "text-right")}>Outcome</th>
                <th scope="col" className={TH}><span className="absolute h-[1px] w-[1px] overflow-hidden [clip:rect(0_0_0_0)]">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const t = e.transfer;
                return (
                  <tr key={e.key} className="text-[14px] font-medium">
                    <td className={cn(TD, "whitespace-nowrap text-muted")}>
                      {formatDay(e.at)}, {formatTime(e.at)}
                    </td>
                    <td className={cn(TD, "font-semibold")}>
                      {e.href ? (
                        <Link href={e.href} className="text-teal underline-offset-4 hover:underline">
                          {e.title}
                        </Link>
                      ) : (
                        e.title
                      )}
                    </td>
                    <td className={cn(TD, "text-right whitespace-nowrap")}><Money sgd={e.amount} />{e.suffix}</td>
                    <td className={cn(TD, "text-right font-display text-[15px] font-bold")}>
                      {e.score ?? <span className="font-sans text-[14px] font-medium text-muted">n/a</span>}
                    </td>
                    <td className={cn(TD, "text-right")}>
                      <Tag variant={e.tag}>{e.label}</Tag>
                    </td>
                    <td className={cn(TD, "text-right")}>
                      {t && <DeleteButton title={e.title} pending={ledger.deleting === t.id} onClick={() => ledger.remove(t)} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
