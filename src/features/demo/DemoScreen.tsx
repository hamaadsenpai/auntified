import Link from "next/link";
import { BackIcon } from "@/components/icons";
import { Screen } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Button, Money, Select } from "@/components/ui";
import { ROUTES } from "@/constants";

const STATS = [
  { label: "Clock", value: "11 Oct 23:52" },
  { label: "Ledger", value: "90 days, 1,284 txns" },
  { label: "Balance", value: <Money sgd={2184.6} /> },
  { label: "Scams stopped", value: "2" },
];

const ACTION_BUTTON = "h-[44px] min-w-[84px] text-[14px]";

export function DemoScreen() {
  return (
    <Screen>
      <div
        role="note"
        className="flex flex-none items-center justify-between gap-[12px] bg-night px-[20px] py-[12px] font-mono text-[12px] font-bold tracking-[.08em] text-white uppercase"
      >
        <span>Demo only</span>
        <span className="font-medium tracking-[0] normal-case">Never shown to customers</span>
      </div>
      <header className="flex h-[64px] flex-none items-center gap-[6px] pr-[20px] pl-[8px]">
        <Link href={ROUTES.SETTINGS} aria-label="Back" className="flex h-[44px] w-[44px] items-center justify-center rounded-[22px]">
          <BackIcon />
        </Link>
        <h1 className="m-0 flex-1 font-display text-[19px] leading-[1.1] font-bold">Demo controls</h1>
        <AuntieBao mood="sleep" width={44} height={41} />
      </header>
      <main className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto px-[20px] pb-[20px] *:shrink-0">
        <dl className="m-0 grid grid-cols-2 gap-[12px] rounded-[16px] border-[1.5px] border-dashed border-slate p-[14px]">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-[2px]">
              <dt className="text-[12px] font-medium text-muted">{s.label}</dt>
              <dd className="m-0 font-mono text-[14px] font-semibold">{s.value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col border-t border-line">
          <div className="flex items-center justify-between gap-[12px] border-b border-line py-[14px]">
            <span className="flex flex-col gap-[2px]">
              <span className="text-[16px] font-semibold">Seed 90 days of data</span>
              <span className="text-[13px] font-medium text-muted">Rebuilds ledger, patterns and goal</span>
            </span>
            <Button className={ACTION_BUTTON}>Seed</Button>
          </div>
          <div className="flex items-center justify-between gap-[12px] border-b border-line py-[14px]">
            <span className="flex flex-col gap-[2px]">
              <span className="text-[16px] font-semibold">Fire a scam payment</span>
              <span className="text-[13px] font-medium text-muted"><Money sgd={1850} /> to a 6 minute old payee</span>
            </span>
            <Button className={ACTION_BUTTON}>Fire</Button>
          </div>
          <div className="flex flex-col gap-[10px] border-b border-line py-[14px]">
            <span className="flex flex-col gap-[2px]">
              <label htmlFor="jump" className="text-[16px] font-semibold">
                Jump the clock
              </label>
              <span className="text-[13px] font-medium text-muted">Ends cool downs, triggers the next roast</span>
            </span>
            <div className="flex gap-[8px]">
              <Select id="jump" defaultValue="Plus 24 hours" wrapperClassName="flex-1" className="h-[44px] text-[15px]">
                <option>Plus 1 hour</option>
                <option>Plus 24 hours</option>
                <option>Plus 7 days</option>
              </Select>
              <Button className={ACTION_BUTTON}>Jump</Button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-[12px] py-[14px]">
            <span className="flex flex-col gap-[2px]">
              <span className="text-[16px] font-semibold">Reset state</span>
              <span className="text-[13px] font-medium text-muted">Clears ledger, log and settings</span>
            </span>
            <button
              type="button"
              className="h-[44px] min-w-[84px] cursor-pointer rounded-[12px] border-[1.5px] border-night bg-white text-[14px] font-semibold text-night"
            >
              Reset
            </button>
          </div>
        </div>
      </main>
    </Screen>
  );
}
