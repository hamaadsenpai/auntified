import { BottomNav, Screen } from "@/components/layout";
import { Chip, Money, Tag } from "@/components/ui";
import { cn } from "@/utils";
import { ENTRIES, FILTERS } from "./entries";

export function LedgerScreen() {
  return (
    <Screen className="lg:hidden">
      <header className="flex flex-none flex-col gap-[2px] px-[20px] pt-[16px] pb-[8px]">
        <h1 className="m-0 font-display text-[22px] leading-[1.1] font-bold">History</h1>
        <span className="text-[13px] font-medium text-muted">Every roast and verdict, newest first</span>
      </header>
      <div role="group" aria-label="Filter" className="flex flex-none gap-[8px] px-[20px] pt-[6px] pb-[10px]">
        <Chip aria-pressed="true" className="border-none bg-teal px-[16px] text-white">
          All
        </Chip>
        {FILTERS.map((f) => (
          <Chip key={f} aria-pressed="false">
            {f}
          </Chip>
        ))}
      </div>
      <ol className="m-0 flex min-h-0 flex-1 list-none flex-col overflow-y-auto border-t border-line px-[20px] *:shrink-0">
        {ENTRIES.map((e, i) => (
          <li
            key={`${e.date}-${e.time}`}
            className={cn(
              "grid min-h-[62px] grid-cols-[56px_1fr_28px_auto] items-center gap-[10px]",
              i < ENTRIES.length - 1 && "border-b border-line",
            )}
          >
            <span className="text-[12px] leading-[1.3] font-medium text-muted">
              {e.date}
              <br />
              {e.time}
            </span>
            <span className="flex flex-col gap-[1px]">
              <span className="text-[14px] font-semibold">{e.title}</span>
              <span className="text-[13px] font-medium text-muted"><Money sgd={e.amount} />{e.suffix}</span>
            </span>
            {e.score === undefined ? (
              <span></span>
            ) : (
              <span className="text-right font-display text-[15px] font-bold">{e.score}</span>
            )}
            <Tag variant={e.tag}>{e.label}</Tag>
          </li>
        ))}
      </ol>
      <BottomNav active="ledger" />
    </Screen>
  );
}
