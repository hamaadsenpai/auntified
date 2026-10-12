import Link from "next/link";
import { AuntieBao } from "@/components/mascot";
import { Card, Chip, Money, Tag } from "@/components/ui";
import { cn } from "@/utils";
import { ENTRIES, FILTERS } from "./entries";

const CARD = "flex flex-col gap-[4px] rounded-[22px] px-[24px] py-[20px] shadow-hard-md";
const TH = "border-b-[1.5px] border-line-strong px-[12px] pb-[10px] text-left text-[12px] font-bold tracking-[0.04em] text-muted uppercase";
const TD = "border-b border-line px-[12px] py-[14px]";

export function LedgerDesktop() {
  return (
    <main className="hidden min-h-dvh min-w-0 flex-col gap-[24px] bg-white px-[40px] py-[32px] lg:flex">
      <header className="flex flex-col gap-[2px]">
        <span className="text-[13px] font-medium text-muted">27 Sep to 11 Oct 2026</span>
        <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">History</h1>
      </header>
      <div className="grid grid-cols-3 gap-[16px]">
        <Card className={CARD}>
          <div className="flex justify-between gap-[8px]">
            <div className="flex flex-col gap-[4px]">
              <span className="text-[13px] font-medium text-muted">Scams blocked</span>
              <span className="font-display text-[34px] leading-[1.1] font-bold">2</span>
              <span className="text-[13px] font-medium text-muted"><Money sgd={1852.99} /> kept</span>
            </div>
            <AuntieBao mood="smug" width={60} height={56} />
          </div>
        </Card>
        <Card className={CARD}>
          <span className="text-[13px] font-medium text-muted">Payments checked</span>
          <span className="font-display text-[34px] leading-[1.1] font-bold">5</span>
          <span className="text-[13px] font-medium text-muted">1 passed, 1 overridden</span>
        </Card>
        <Card className={CARD}>
          <span className="text-[13px] font-medium text-muted">Leaked to habits</span>
          <span className="font-display text-[34px] leading-[1.1] font-bold"><Money sgd={312.18} /></span>
          <span className="text-[13px] font-medium text-muted">across 3 weekly roasts</span>
        </Card>
      </div>
      <section aria-labelledby="dlog-h" className="flex flex-col gap-[16px] rounded-[24px] border-[2.5px] border-ink px-[24px] py-[20px] shadow-hard-md">
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <div className="flex flex-col gap-[2px]">
            <h2 id="dlog-h" className="m-0 font-display text-[17px] font-bold">
              Every roast and verdict
            </h2>
            <span className="text-[13px] font-medium text-muted">Newest first</span>
          </div>
          <div role="group" aria-label="Filter" className="flex gap-[8px]">
            <Chip aria-pressed="true" className="border-none bg-teal px-[16px] text-white">
              All
            </Chip>
            {FILTERS.map((f) => (
              <Chip key={f} aria-pressed="false">
                {f}
              </Chip>
            ))}
          </div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th scope="col" className={TH}>When</th>
              <th scope="col" className={TH}>What</th>
              <th scope="col" className={cn(TH, "text-right")}>Amount</th>
              <th scope="col" className={cn(TH, "text-right")}>Risk score</th>
              <th scope="col" className={cn(TH, "text-right")}>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {ENTRIES.map((e) => (
              <tr key={`${e.date}-${e.time}`} className="text-[14px] font-medium">
                <td className={cn(TD, "whitespace-nowrap text-muted")}>
                  {e.date}, {e.time}
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
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
