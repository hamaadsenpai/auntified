import { SendIcon, SpeakerIcon } from "@/components/icons";
import { BackHeader } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Chip, Money, UserBubble } from "@/components/ui";
import { ROUTES } from "@/constants";

export function AskMobile() {
  return (
    <>
      <BackHeader backHref={ROUTES.HOME} title="Ask Auntie" subtitle="She reads your ledger only" className="border-b border-line" />
      <main className="flex min-h-0 flex-1 flex-col justify-end gap-[12px] overflow-y-auto px-[16px] py-[18px] *:shrink-0">
        <UserBubble>Can I afford the <Money sgd={129} whole /> sneakers?</UserBubble>
        <div className="flex items-center gap-[10px]">
          <AuntieBao mood="smug" width={40} height={37} />
          <span className="text-[13px] font-bold text-teal">Auntie Kumari</span>
        </div>
        <div className="flex items-end gap-[8px]">
          <div className="flex max-w-[296px] flex-col gap-[10px] rounded-[6px_22px_22px_22px] border-[2.5px] border-ink bg-mint px-[14px] py-[12px]">
            <p className="m-0 font-display text-[16px] leading-[1.4] font-medium">Can, but only just. After rent and your goal:</p>
            <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-[12px] gap-y-[4px] rounded-[12px] bg-white px-[12px] py-[10px]">
              <span className="text-[13px] font-medium text-muted">Spare till 31 Oct</span>
              <span className="font-display text-[17px] font-bold"><Money sgd={214} whole /></span>
              <span className="text-[13px] font-medium text-muted">After sneakers</span>
              <span className="font-display text-[17px] font-bold"><Money sgd={85} whole /></span>
            </div>
            <p className="m-0 font-display text-[16px] leading-[1.4] font-medium">Buy them, then no more late deliveries. Deal?</p>
          </div>
          <button
            type="button"
            aria-label="Play her reply aloud"
            className="flex h-[44px] w-[44px] flex-none cursor-pointer items-center justify-center rounded-[22px] border-[1.5px] border-line-strong bg-white"
          >
            <SpeakerIcon />
          </button>
        </div>
      </main>
      <div className="flex flex-none flex-col gap-[8px] px-[16px] pb-[12px]">
        <span className="text-[13px] font-semibold text-muted">Try asking</span>
        <div className="flex flex-wrap gap-[8px]">
          <Chip>Can I afford this?</Chip>
          <Chip>Where did my money go?</Chip>
          <Chip>Am I on track for <Money sgd={1000} whole />?</Chip>
        </div>
      </div>
      <form className="flex flex-none gap-[8px] border-t border-line px-[16px] pt-[12px] pb-[24px]">
        <label htmlFor="ask" className="absolute h-[1px] w-[1px] overflow-hidden [clip:rect(0_0_0_0)]">
          Ask Auntie
        </label>
        <input
          id="ask"
          type="text"
          placeholder="Ask about your money"
          className="h-[52px] min-w-0 flex-1 rounded-[16px] border-2 border-ink bg-white px-[14px] text-[16px] font-medium"
        />
        <button
          type="button"
          aria-label="Send"
          className="flex h-[52px] w-[52px] flex-none cursor-pointer items-center justify-center rounded-full border-[2.5px] border-ink bg-teal shadow-hard-xs"
        >
          <SendIcon />
        </button>
      </form>
    </>
  );
}
