import { BackHeader } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Button, Money, NudgeCard, ProgressBar } from "@/components/ui";
import { ROUTES } from "@/constants";
import { LEAKS } from "./leaks";

export function RoastMobile() {
  return (
    <>
      <BackHeader backHref={ROUTES.HOME} title="Weekly roast" subtitle="5 to 11 Oct 2026" />
      <main className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto px-[20px] pt-[6px] pb-[16px] *:shrink-0">
        <div className="flex flex-col gap-[4px]">
          <div className="flex items-end justify-between gap-[8px]">
            <div className="flex flex-col gap-[4px]">
              <span className="text-[13px] font-medium text-muted">Leaked this week</span>
              <span className="font-display text-[36px] leading-none font-bold"><Money sgd={102.48} /></span>
            </div>
            <div className="flex flex-col items-end gap-[2px]">
              <span className="rounded-full border-[2.5px] border-ink bg-white px-[11px] py-[5px] font-display text-[13px] font-semibold whitespace-nowrap">
                aiyoh...
              </span>
              <AuntieBao mood="meh" width={72} height={67} />
            </div>
          </div>
        </div>
        <ul className="m-0 flex list-none flex-col border-t border-line p-0">
          {LEAKS.map((leak) => (
            <li key={leak.name} className="grid grid-cols-[1fr_auto] gap-x-[12px] gap-y-[3px] border-b border-line py-[12px]">
              <span className="text-[16px] font-semibold">{leak.name}</span>
              <span className="font-display text-[17px] font-bold"><Money sgd={leak.amount} /></span>
              <span className="col-span-full font-display text-[15px] leading-[1.35] font-medium text-muted">{leak.note}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-[8px] rounded-[18px] bg-wash px-[16px] py-[14px]">
          <span className="text-[13px] font-semibold text-muted">Forecast savings by 31 Oct</span>
          <div className="flex items-baseline justify-between gap-[8px]">
            <span className="font-display text-[30px] leading-none font-bold"><Money sgd={640} whole /></span>
            <span className="text-[13px] font-medium text-muted">Goal <Money sgd={1000} whole /></span>
          </div>
          <ProgressBar value={64} className="bg-track-alt" />
          <span className="text-[13px] font-semibold"><Money sgd={360} whole /> short. 20 days left.</span>
        </div>
        <NudgeCard>Cancel StreamPlus, skip two late deliveries. <Money sgd={75} whole /> back.</NudgeCard>
      </main>
      <div className="flex flex-none flex-col gap-[10px] border-t border-line px-[20px] pt-[12px] pb-[24px]">
        <Button>Cancel StreamPlus</Button>
        <Button variant="secondary" href={ROUTES.ASK}>
          Ask Auntie about it
        </Button>
      </div>
    </>
  );
}
