import Link from "next/link";
import { BackHeader, Screen } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Button, Money, RiskMeter } from "@/components/ui";
import { ROUTES } from "@/constants";

export function WarnScreen() {
  return (
    <Screen>
      <BackHeader backHref={ROUTES.PAY} title="Hold on" subtitle={<><Money sgd={480} /> to Jia Hui Lim, 9 Oct 23:40</>} />
      <main className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-[20px] pt-[4px] pb-[16px] *:shrink-0">
        <div role="alert" className="flex flex-col gap-[10px] rounded-[18px] border-[2.5px] border-ink bg-sun p-[16px]">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] font-bold tracking-[.06em] uppercase">Warn</span>
            <span className="flex items-baseline gap-[2px]">
              <span className="font-display text-[30px] leading-none font-bold">54</span>
              <span className="text-[13px] font-semibold">/100</span>
            </span>
          </div>
          <RiskMeter score={54} middle="white" ring="ring-sun" />
          <div className="flex items-center gap-[10px]">
            <AuntieBao mood="meh" width={52} height={48} />
            <p className="m-0 font-display text-[16px] leading-[1.4] font-medium">
              Jia Hui you know. But this hour and this amount? Not like you.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-[2px]">
          <h2 className="m-0 mb-[4px] font-display text-[16px] font-bold">Two things worry her</h2>
          <div className="flex flex-col gap-[2px] border-b border-line py-[10px]">
            <span className="text-[15px] font-semibold">Outside your usual hours</span>
            <span className="text-[14px] font-medium text-muted">You rarely pay after 10pm.</span>
          </div>
          <div className="flex flex-col gap-[2px] py-[10px]">
            <span className="text-[15px] font-semibold">4x your median transfer</span>
            <span className="text-[14px] font-medium text-muted">Your median is <Money sgd={120} whole />.</span>
          </div>
        </div>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="confirm" className="text-[15px] font-semibold">
            Type SEND 480 to pay anyway
          </label>
          <input
            id="confirm"
            type="text"
            placeholder="SEND 480"
            autoComplete="off"
            className="h-[52px] rounded-[16px] border-2 border-ink bg-white px-[14px] font-mono text-[16px] font-semibold tracking-[.04em]"
          />
          <span className="text-[13px] leading-[1.4] font-medium text-muted">
            Overrides are logged in your{" "}
            <Link href={ROUTES.LEDGER} className="font-semibold text-teal">
              decision log
            </Link>
            .
          </span>
        </div>
      </main>
      <div className="flex flex-none flex-col gap-[10px] px-[20px] pt-[12px] pb-[24px]">
        <Button>Pay anyway</Button>
        <Button variant="secondary">Cancel</Button>
      </div>
    </Screen>
  );
}
