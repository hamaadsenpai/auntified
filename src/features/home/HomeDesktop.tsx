import Link from "next/link";
import { SendIcon, SettingsIcon } from "@/components/icons";
import { AuntieBao } from "@/components/mascot";
import { AuntieBubble, Card, Chip, Money, NudgeCard, ProgressBar, Tag, UserBubble } from "@/components/ui";
import { ROUTES } from "@/constants";

const CARD = "flex flex-col gap-[4px] rounded-[22px] px-[24px] py-[20px] shadow-hard-md";
const PANEL = "flex flex-col rounded-[24px] border-[2.5px] border-ink shadow-hard-md";

const PATTERNS = [
  { label: "Food delivery", now: 56.30, normal: 22, nowWidth: "w-[100%]", normalWidth: "w-[39%]" },
  { label: "Rides", now: 48.90, normal: 30, nowWidth: "w-[87%]", normalWidth: "w-[53%]" },
  { label: "Bubble tea", now: 27.20, normal: 12, nowWidth: "w-[48%]", normalWidth: "w-[21%]" },
];

const ROW = "grid min-h-[48px] grid-cols-[1fr_auto_auto] items-center gap-[12px] text-[14px] font-medium";

export function HomeDesktop() {
  return (
    <main className="hidden min-h-dvh min-w-0 flex-col gap-[24px] bg-white px-[40px] py-[32px] lg:flex">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-[2px]">
          <span className="text-[13px] font-medium text-muted">Sat 11 Oct 2026</span>
          <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">Home</h1>
        </div>
        <Link href={ROUTES.SETTINGS} aria-label="Settings" className="flex h-[44px] w-[44px] items-center justify-center rounded-[22px] border-[1.5px] border-line-strong">
          <SettingsIcon />
        </Link>
      </header>
      <div className="grid grid-cols-[2fr_1fr_1fr] gap-[16px]">
        <Card className={CARD}>
          <span className="text-[13px] font-medium text-muted">Available balance</span>
          <span className="font-display text-[48px] leading-[1.05] font-bold"><Money sgd={2184.6} /></span>
          <span className="text-[13px] font-medium text-muted">Everyday Account ••4417</span>
        </Card>
        <Card className={CARD}>
          <div className="flex justify-between gap-[8px]">
            <div className="flex flex-col gap-[4px]">
              <span className="text-[13px] font-medium text-muted">Saved with Auntie</span>
              <span className="font-display text-[34px] leading-[1.1] font-bold"><Money sgd={412} whole /></span>
              <span className="text-[13px] font-medium text-muted">since 1 Aug</span>
            </div>
            <AuntieBao mood="smug" width={60} height={56} />
          </div>
        </Card>
        <Card className={CARD}>
          <span className="text-[13px] font-medium text-muted">Scams stopped</span>
          <span className="font-display text-[34px] leading-[1.1] font-bold">2</span>
          <span className="text-[13px] font-medium text-muted"><Money sgd={1852.99} /> kept</span>
        </Card>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-[24px]">
        <section aria-label="Auntie's chat" className={`${PANEL} gap-[14px] p-[24px]`}>
          <div className="flex max-w-[520px] items-start gap-[12px]">
            <AuntieBao mood="meh" width={52} height={48} />
            <div className="flex flex-col gap-[6px]">
              <span className="text-[13px] font-bold text-teal">Auntie Kumari</span>
              <AuntieBubble className="rounded-[6px_24px_24px_24px] px-[18px] py-[14px] text-[18px] text-pretty">
                Four bubble teas and two food deliveries this week. <Money sgd={83.5} />. You think money grows on pandan trees?
              </AuntieBubble>
            </div>
          </div>
          <div className="ml-[48px] grid max-w-[520px] grid-cols-[1fr_1fr] gap-[12px]">
            <div className="flex flex-col gap-[8px] rounded-[16px] border border-line-strong px-[16px] py-[14px]">
              <span className="text-[13px] font-semibold text-muted">End of month forecast</span>
              <div className="flex items-baseline gap-[8px]">
                <span className="font-display text-[26px] leading-none font-bold"><Money sgd={640} whole /></span>
                <span className="text-[13px] font-medium text-muted">of <Money sgd={1000} whole /></span>
              </div>
              <ProgressBar value={64} />
            </div>
            <NudgeCard className="gap-[4px] rounded-[20px] px-[16px] py-[14px]" bodyClassName="text-[16px]">
              Cancel StreamPlus, skip two late deliveries. <Money sgd={75} whole /> back.
            </NudgeCard>
          </div>
          <div className="ml-[48px] flex gap-[24px]">
            <Link href={ROUTES.ROAST} className="flex min-h-[44px] items-center text-[15px] font-semibold text-teal">
              Read the full roast
            </Link>
          </div>
          <UserBubble className="max-w-[360px] rounded-[20px_20px_4px_20px] px-[16px] py-[12px]">Okay okay, the teas were for the team.</UserBubble>
          <form className="mt-auto flex flex-wrap items-center gap-[8px]">
            <label htmlFor="dask" className="absolute h-[1px] w-[1px] overflow-hidden [clip:rect(0_0_0_0)]">
              Ask Auntie
            </label>
            <input
              id="dask"
              type="text"
              placeholder="Ask Auntie about your money"
              className="h-[52px] min-w-[240px] flex-1 rounded-[14px] border-[1.5px] border-slate bg-white px-[16px] text-[16px] font-medium"
            />
            <button
              type="button"
              aria-label="Send"
              className="flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-full border-[2.5px] border-ink bg-teal shadow-hard-xs"
            >
              <SendIcon />
            </button>
            <div className="flex w-full gap-[8px]">
              <Chip className="border-[1.5px]">Can I afford this?</Chip>
              <Chip className="border-[1.5px]">Where did my money go?</Chip>
              <Chip className="border-[1.5px]">Am I on track?</Chip>
            </div>
          </form>
        </section>
        <div className="flex flex-col gap-[24px]">
          <section className={`${PANEL} gap-[14px] px-[24px] py-[20px]`}>
            <div className="flex items-baseline justify-between">
              <h2 className="m-0 font-display text-[17px] font-bold">This week vs normal</h2>
              <Link href={ROUTES.PATTERNS} className="text-[13px] font-semibold text-teal">
                Your patterns
              </Link>
            </div>
            {PATTERNS.map((p) => (
              <div key={p.label} className="flex flex-col gap-[5px]">
                <div className="flex justify-between text-[14px] font-semibold">
                  <span>{p.label}</span>
                  <span>
                    <Money sgd={p.now} /> <span className="font-medium text-muted">vs <Money sgd={p.normal} whole /></span>
                  </span>
                </div>
                <div className="flex h-[8px]">
                  <span className={`${p.nowWidth} rounded-[4px] bg-teal`}></span>
                </div>
                <div className="flex h-[8px]">
                  <span className={`${p.normalWidth} rounded-[4px] bg-mint`}></span>
                </div>
              </div>
            ))}
          </section>
          <section className={`${PANEL} gap-[4px] px-[24px] py-[20px]`}>
            <div className="flex items-baseline justify-between pb-[6px]">
              <h2 className="m-0 font-display text-[17px] font-bold">Latest verdicts</h2>
              <Link href={ROUTES.LEDGER} className="text-[13px] font-semibold text-teal">
                Open ledger
              </Link>
            </div>
            <div className={`${ROW} border-b border-line`}>
              <span><strong className="font-semibold">Kelvin Tan</strong> <Money sgd={1850} /></span>
              <span className="font-display text-[15px] font-bold">86</span>
              <Tag variant="blocked">Blocked</Tag>
            </div>
            <div className={`${ROW} border-b border-line`}>
              <span><strong className="font-semibold">Jia Hui Lim</strong> <Money sgd={480} /></span>
              <span className="font-display text-[15px] font-bold">54</span>
              <Tag variant="outline">Overridden</Tag>
            </div>
            <div className={ROW}>
              <span><strong className="font-semibold">Mum</strong> <Money sgd={300} /></span>
              <span className="font-display text-[15px] font-bold">8</span>
              <Tag variant="passed">Passed</Tag>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
