import Link from "next/link";
import { BackIcon, MicIcon, SendIcon } from "@/components/icons";
import { Screen } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { AuntieBubble, Money, RiskMeter, UserBubble } from "@/components/ui";
import { ROUTES } from "@/constants";

export function CheckScreen() {
  return (
    <Screen className="lg:hidden">
      <header className="sticky top-0 z-[1] flex flex-none flex-col gap-[10px] border-b border-line bg-white pt-[8px] pr-[20px] pb-[14px] pl-[8px] shadow-[0_6px_16px_rgba(15,42,40,.05)]">
        <div className="flex items-center gap-[6px]">
          <Link href={ROUTES.PAY_REVIEW} aria-label="Back" className="flex h-[44px] w-[44px] items-center justify-center rounded-[22px]">
            <BackIcon />
          </Link>
          <div className="flex flex-1 flex-col gap-[1px]">
            <h1 className="m-0 font-display text-[19px] leading-[1.1] font-bold">Quick check</h1>
            <span className="text-[13px] font-medium text-muted"><Money sgd={1850} /> to Kelvin Tan</span>
          </div>
          <div className="flex items-baseline gap-[2px]">
            <span className="font-display text-[30px] leading-none font-bold">78</span>
            <span className="text-[13px] font-semibold text-muted">/100</span>
          </div>
        </div>
        <div className="flex flex-col gap-[6px] pl-[12px]">
          <RiskMeter score={78} />
          <div className="grid grid-cols-[40fr_30fr_31fr] gap-[3px] text-[11px] font-semibold text-muted">
            <span>Pass 0-39</span>
            <span>Warn 40-69</span>
            <span className="text-night">Block 70+</span>
          </div>
          <div className="flex gap-[16px] text-[13px] font-medium text-muted">
            <span>
              Rules <strong className="text-night">46</strong>
            </span>
            <span>
              Model <strong className="text-night">32</strong>
            </span>
            <span>Still asking</span>
          </div>
        </div>
      </header>
      <main className="flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto p-[16px] *:shrink-0">
        <div className="flex items-center gap-[10px]">
          <AuntieBao mood="alarm" width={40} height={37} />
          <span className="text-[13px] font-bold text-teal">Auntie Kumari</span>
        </div>
        <AuntieBubble className="max-w-[290px] py-[10px]">Who is Kelvin Tan to you?</AuntieBubble>
        <UserBubble className="py-[10px]">Er, friend of a friend. He helps with investing.</UserBubble>
        <p role="status" className="mx-0 my-[2px] flex items-center gap-[8px] text-[12px] leading-[1.35] font-semibold text-muted">
          <span className="h-[8px] w-[8px] flex-none rounded-[4px] bg-sea"></span>
          {"Checked payee history. First seen 23:46 today, 0 transfers, 3 scam reports."}
        </p>
        <AuntieBubble className="max-w-[290px] rounded-[22px] py-[10px]">Did he tell you to pay today?</AuntieBubble>
        <UserBubble className="py-[10px]">He said the slot closes tonight.</UserBubble>
        <div className="flex max-w-[300px] flex-col gap-[5px]">
          <AuntieBubble className="rounded-[22px] text-[17px] font-semibold shadow-[inset_0_0_0_2px_var(--color-teal)]">
            Have you met him in person? Yes or no.
          </AuntieBubble>
          <span className="pl-[4px] text-[12px] font-medium text-muted">Question 3 of 3</span>
        </div>
      </main>
      <form className="flex flex-none flex-col gap-[8px] border-t border-line px-[16px] pt-[12px] pb-[20px]">
        <label htmlFor="answer" className="text-[13px] font-semibold text-muted">
          Your answer
        </label>
        <div className="flex gap-[8px]">
          <button
            type="button"
            aria-label="Answer by voice"
            className="flex h-[52px] w-[52px] flex-none cursor-pointer items-center justify-center rounded-full border-[2.5px] border-teal bg-white px-[6px] py-[1px]"
          >
            <MicIcon />
          </button>
          <input
            id="answer"
            type="text"
            placeholder="Type here"
            className="h-[52px] min-w-0 flex-1 rounded-[16px] border-2 border-ink bg-white px-[14px] text-[16px] font-medium"
          />
          <button
            type="button"
            aria-label="Send answer"
            className="flex h-[52px] w-[52px] flex-none cursor-pointer items-center justify-center rounded-full border-[2.5px] border-ink bg-teal px-[6px] py-[1px] shadow-hard-xs"
          >
            <SendIcon />
          </button>
        </div>
        <p className="m-0 text-[13px] leading-[1.4] font-medium text-muted">Auntie never asks for your PIN, password or OTP.</p>
      </form>
    </Screen>
  );
}
