import Link from "next/link";
import { Screen } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Avatar, Button, Card, Money } from "@/components/ui";
import { ROUTES } from "@/constants";

export function BlockedScreen() {
  return (
    <Screen>
      <header role="alert" className="flex flex-none flex-col gap-[8px] bg-brick px-[20px] pt-[24px] pb-[22px] text-white">
        <div className="flex items-baseline justify-between gap-[12px]">
          <span className="text-[12px] font-bold tracking-[.08em] uppercase">Payment stopped</span>
          <span className="text-[13px] font-semibold">Score 86/100</span>
        </div>
        <div className="flex items-center gap-[12px]">
          <h1 className="m-0 flex-1 font-display text-[26px] leading-[1.12] font-bold text-pretty">
            I stopped <Money sgd={1850} /> to Kelvin Tan.
          </h1>
          <span className="flex rounded-[20px] border-[2.5px] border-ink bg-cream p-[4px]">
            <AuntieBao mood="alarm" width={72} height={67} />
          </span>
        </div>
        <p className="m-0 font-display text-[15px] leading-[1.4] font-medium">
          New payee, a deadline tonight, most of your balance. That is how scams look.
        </p>
      </header>
      <main className="flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto px-[20px] pt-[18px] pb-[20px] *:shrink-0">
        <div className="flex flex-col gap-[6px] rounded-[16px] border-[1.5px] border-brick px-[14px] py-[12px]">
          <span className="text-[12px] font-medium text-muted">Matched scam pattern</span>
          <span className="self-start rounded-full bg-brick px-[11px] py-[5px] text-[14px] font-bold text-white">
            Investment scam: urgent slot
          </span>
          <span className="text-[13px] font-medium text-muted">Stranger, quick returns, pay before tonight.</span>
        </div>
        <div className="flex min-h-[56px] items-center justify-between gap-[12px] border-b border-line">
          <span className="flex flex-col gap-[2px]">
            <span className="text-[15px] font-semibold">24 hour cool down</span>
            <span className="text-[13px] font-medium text-muted">No transfers to this payee until then</span>
          </span>
          <span className="text-right font-display text-[15px] leading-[1.25] font-bold">
            Lifts Sun 12 Oct
            <br />
            11:52pm
          </span>
        </div>
        <Card className="flex flex-col gap-[12px] rounded-[22px] px-[16px] py-[14px]">
          <div className="flex items-center gap-[12px]">
            <Avatar initials="ML" size={44} as="div" className="flex-none bg-mint text-[15px]" />
            <div className="flex flex-col gap-[2px]">
              <span className="text-[12px] font-medium text-muted">Trusted contact</span>
              <span className="text-[16px] font-semibold">Mei Lin, sister</span>
              <span className="text-[13px] font-medium text-muted">+65 9123 4567</span>
            </div>
          </div>
          <Button href="tel:+6591234567">Call Mei Lin</Button>
        </Card>
        <Button variant="secondary">Appeal this block</Button>
        <Link
          href={ROUTES.PAY_BLOCKED_WHY}
          className="flex min-h-[44px] items-center justify-center text-[15px] font-semibold text-teal"
        >
          See how she scored it
        </Link>
        <p className="m-0 mt-auto text-center text-[12px] leading-[1.4] font-medium text-muted">
          Auntified is an assistant, not a financial adviser.
        </p>
      </main>
    </Screen>
  );
}
