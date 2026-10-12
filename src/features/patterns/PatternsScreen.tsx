import { BackHeader, Screen } from "@/components/layout";
import { Card, Money } from "@/components/ui";
import { ROUTES } from "@/constants";

const CATEGORIES = [
  { name: "Food delivery", week: 56.30, normal: 22, weekWidth: "100%", normalWidth: "39%" },
  { name: "Rides", week: 48.90, normal: 30, weekWidth: "87%", normalWidth: "53%" },
  { name: "Bubble tea", week: 27.20, normal: 12, weekWidth: "48%", normalWidth: "21%" },
];

export function PatternsScreen() {
  return (
    <Screen>
      <BackHeader backHref={ROUTES.SETTINGS} title="Your patterns" subtitle="What she scores you against. Last 90 days." />
      <main className="flex min-h-0 flex-1 flex-col gap-[22px] overflow-y-auto px-[20px] pt-[8px] pb-[24px] *:shrink-0">
        <div className="grid grid-cols-2 gap-[10px]">
          <Card className="flex flex-col gap-[2px] p-[12px]">
            <span className="text-[12px] font-medium text-muted">Median transfer</span>
            <span className="font-display text-[26px] leading-[1.1] font-bold"><Money sgd={120} whole /></span>
          </Card>
          <Card className="flex flex-col gap-[2px] p-[12px]">
            <span className="text-[12px] font-medium text-muted">p95 transfer</span>
            <span className="font-display text-[26px] leading-[1.1] font-bold"><Money sgd={640} whole /></span>
          </Card>
        </div>
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-baseline justify-between">
            <h2 className="m-0 font-display text-[16px] font-bold">Usual hours</h2>
            <span className="text-[14px] font-semibold">8am to 10pm</span>
          </div>
          <div aria-label="Usual transacting hours, 8am to 10pm" role="img" className="relative flex h-[28px] rounded-[8px] bg-track">
            <span className="absolute top-0 bottom-0 left-[33.3%] w-[58.3%] rounded-[4px] bg-sea"></span>
            <span className="absolute top-[-4px] bottom-[-4px] left-[99%] w-[3px] rounded-[2px] bg-night"></span>
          </div>
          <div className="flex justify-between text-[12px] font-medium text-muted">
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
            <span className="font-bold text-night">23:52 tonight</span>
          </div>
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
          {CATEGORIES.map((c) => (
            <div key={c.name} className="flex flex-col gap-[5px]">
              <div className="flex justify-between text-[14px] font-semibold">
                <span>{c.name}</span>
                <span>
                  <Money sgd={c.week} /> <span className="font-medium text-muted">vs <Money sgd={c.normal} whole /></span>
                </span>
              </div>
              <div className="flex h-[8px]">
                <span className="rounded-[4px] bg-teal" style={{ width: c.weekWidth }}></span>
              </div>
              <div className="flex h-[8px]">
                <span className="rounded-[4px] bg-mint" style={{ width: c.normalWidth }}></span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-[4px] rounded-[16px] border-[1.5px] border-night px-[16px] py-[14px]">
          <span className="font-display text-[15px] font-bold">This week ran hot</span>
          <span className="text-[14px] leading-[1.4] font-medium text-muted">
            Spending is 2.1x normal, so payment checks are stricter until it settles.
          </span>
        </div>
      </main>
    </Screen>
  );
}
