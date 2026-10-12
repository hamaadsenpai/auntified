import Link from "next/link";
import { BackIcon } from "@/components/icons";
import { AuntieBao } from "@/components/mascot";
import { AuntieBubble, Button, Money, NudgeCard, ProgressBar } from "@/components/ui";
import { ROUTES } from "@/constants";
import { LEAKS } from "./leaks";

export function RoastDesktop() {
  return (
    <main className="hidden min-h-dvh min-w-0 flex-col gap-[28px] bg-white px-[40px] py-[32px] lg:flex">
      <header className="flex flex-col gap-[6px]">
        <Link href={ROUTES.HOME} className="flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-semibold text-teal no-underline">
          <BackIcon size={18} />
          Home
        </Link>
        <div className="flex items-baseline gap-[14px]">
          <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">Weekly roast</h1>
          <span className="text-[15px] font-medium text-muted">5 to 11 Oct 2026</span>
        </div>
      </header>
      <div className="grid flex-1 grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-[32px]">
        <section className="flex flex-col gap-[20px]">
          <div className="flex items-end gap-[28px]">
            <div className="flex flex-col gap-[4px]">
              <span className="text-[14px] font-medium text-muted">Leaked this week</span>
              <span className="font-display text-[64px] leading-none font-bold"><Money sgd={102.48} /></span>
            </div>
            <div className="flex items-end gap-[6px]">
              <AuntieBao mood="meh" width={110} height={102} />
              <div className="mb-[60px] flex flex-col items-start gap-[4px]">
                <span className="rounded-full border-[2.5px] border-ink bg-white px-[16px] py-[8px] font-display text-[16px] font-semibold whitespace-nowrap">
                  a hundred dollars... aiyoh.
                </span>
                <span className="ml-[-6px] h-[10px] w-[10px] rounded-[5px] border-[2.5px] border-ink bg-white"></span>
              </div>
            </div>
          </div>
          <div className="flex max-w-[600px] items-start gap-[12px]">
            <AuntieBao mood="meh" width={52} height={48} />
            <div className="flex flex-col gap-[6px]">
              <span className="text-[13px] font-bold text-teal">Auntie Kumari</span>
              <AuntieBubble className="rounded-[6px_24px_24px_24px] px-[18px] py-[14px] text-[18px]">
                Three leaks, all small, all every week. This is how <Money sgd={1000} whole /> becomes <Money sgd={640} whole />.
              </AuntieBubble>
            </div>
          </div>
          <ul className="m-0 flex list-none flex-col border-t-[1.5px] border-night p-0">
            {LEAKS.map((leak) => (
              <li key={leak.name} className="grid grid-cols-[220px_1fr_auto] items-baseline gap-[20px] border-b border-line py-[18px]">
                <span className="text-[17px] font-semibold">{leak.name}</span>
                <span className="font-display text-[17px] leading-[1.4] font-medium text-muted">{leak.note}</span>
                <span className="font-display text-[22px] font-bold"><Money sgd={leak.amount} /></span>
              </li>
            ))}
          </ul>
        </section>
        <aside className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[12px] rounded-[20px] bg-wash p-[24px]">
            <span className="text-[14px] font-semibold text-muted">Forecast savings by 31 Oct</span>
            <div className="flex items-baseline justify-between gap-[8px]">
              <span className="font-display text-[44px] leading-none font-bold"><Money sgd={640} whole /></span>
              <span className="text-[14px] font-medium text-muted">Goal <Money sgd={1000} whole /></span>
            </div>
            <ProgressBar value={64} className="h-[12px] rounded-[6px] bg-track-alt" fillClassName="rounded-[6px]" />
            <span className="text-[14px] font-semibold"><Money sgd={360} whole /> short. 20 days left.</span>
          </div>
          <NudgeCard className="gap-[4px] rounded-[20px] px-[20px] py-[16px]" bodyClassName="text-[18px]">
            Cancel StreamPlus, skip two late deliveries. <Money sgd={75} whole /> back.
          </NudgeCard>
          <div className="mt-[8px] flex gap-[10px]">
            <Button className="flex-1">Cancel StreamPlus</Button>
            <Button variant="secondary" className="flex-1">
              Ask Auntie about it
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}
