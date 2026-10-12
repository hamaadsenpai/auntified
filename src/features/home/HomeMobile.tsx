import Link from "next/link";
import { SettingsIcon } from "@/components/icons";
import { BottomNav } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { AuntieBubble, Card, Money, NudgeCard, ProgressBar } from "@/components/ui";
import { ROUTES } from "@/constants";

export function HomeMobile() {
  return (
    <>
      <header className="flex h-[64px] flex-none items-center justify-between pr-[12px] pl-[20px]">
        <span className="flex items-center gap-[8px]">
          <AuntieBao mood="sleep" width={38} height={35} />
          <span className="font-display text-[22px] leading-none font-bold text-night">
            Aunt<span className="text-teal">ified</span>
          </span>
        </span>
        <Link href={ROUTES.SETTINGS} aria-label="Settings" className="flex h-[44px] w-[44px] items-center justify-center rounded-[22px] border-[1.5px] border-line-strong">
          <SettingsIcon />
        </Link>
      </header>
      <div className="flex flex-none flex-col gap-[4px] px-[20px] pb-[14px]">
        <span className="text-[13px] font-medium text-muted">Available balance</span>
        <span className="font-display text-[40px] leading-[1.05] font-bold"><Money sgd={2184.6} /></span>
        <span className="text-[13px] font-medium text-muted">Everyday Account ••4417</span>
      </div>
      <div className="grid flex-none grid-cols-[1fr_1fr] gap-[10px] border-b border-line px-[20px] pb-[16px]">
        <Card className="flex flex-col gap-[2px] px-[12px] py-[10px]">
          <div className="flex justify-between gap-[4px]">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[12px] font-medium text-muted">Saved with Auntie</span>
              <span className="font-display text-[22px] leading-[1.1] font-bold"><Money sgd={412} whole /></span>
              <span className="text-[12px] font-medium text-muted">since 1 Aug</span>
            </div>
            <AuntieBao mood="smug" width={40} height={37} />
          </div>
        </Card>
        <Card className="flex flex-col gap-[2px] px-[12px] py-[10px]">
          <span className="text-[12px] font-medium text-muted">Scams stopped</span>
          <span className="font-display text-[22px] leading-[1.1] font-bold">2</span>
          <span className="text-[12px] font-medium text-muted"><Money sgd={1852.99} /> kept</span>
        </Card>
      </div>
      <main className="flex min-h-0 flex-1 flex-col gap-[12px] overflow-y-auto p-[16px] *:shrink-0">
        <div className="flex max-w-[330px] items-start gap-[10px]">
          <AuntieBao mood="meh" width={44} height={41} />
          <div className="flex flex-col gap-[5px]">
            <span className="text-[13px] font-bold text-teal">Auntie Kumari</span>
            <AuntieBubble className="text-pretty">
              Four bubble teas and two food deliveries this week. <Money sgd={83.5} />. You think money grows on pandan trees?
            </AuntieBubble>
          </div>
        </div>
        <Card className="ml-[42px] flex flex-col gap-[8px] rounded-[22px] px-[16px] py-[14px]">
          <span className="text-[13px] font-semibold text-muted">End of month forecast</span>
          <div className="flex items-baseline justify-between gap-[8px]">
            <span className="font-display text-[26px] leading-none font-bold"><Money sgd={640} whole /></span>
            <span className="text-[13px] font-medium text-muted">of <Money sgd={1000} whole /> goal</span>
          </div>
          <ProgressBar value={64} />
        </Card>
        <NudgeCard className="ml-[42px]">Cancel StreamPlus, skip two late deliveries. <Money sgd={75} whole /> back.</NudgeCard>
        <div className="ml-[42px] flex gap-[20px]">
          <Link href={ROUTES.ROAST} className="flex min-h-[44px] items-center text-[15px] font-semibold text-teal">
            Read the full roast
          </Link>
          <Link href={ROUTES.ASK} className="flex min-h-[44px] items-center text-[15px] font-semibold text-teal">
            Ask Auntie
          </Link>
        </div>
      </main>
      <BottomNav active="home" />
    </>
  );
}
