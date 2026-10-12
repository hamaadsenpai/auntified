import Link from "next/link";
import { BackHeader, Screen } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Avatar, Button, Money, Tag } from "@/components/ui";
import { ROUTES } from "@/constants";

export function ReviewScreen() {
  return (
    <Screen className="lg:hidden">
      <BackHeader backHref={ROUTES.PAY} title="Review transfer" />
      <main className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto px-[20px] pt-[8px] pb-[20px] *:shrink-0">
        <div className="flex flex-col items-center gap-[4px] pt-[8px] pb-[6px]">
          <span className="text-[13px] font-medium text-muted">You are sending</span>
          <span className="font-display text-[48px] leading-none font-bold"><Money sgd={1850} /></span>
        </div>
        <Link
          href={ROUTES.PAYEE("kelvin-tan")}
          className="flex items-center gap-[12px] rounded-[22px] border-[2.5px] border-ink px-[16px] py-[14px] text-night no-underline shadow-hard-sm"
        >
          <Avatar initials="KT" size={44} className="flex-none bg-track text-[15px] text-teal" />
          <span className="flex flex-1 flex-col gap-[2px]">
            <span className="text-[16px] font-semibold">Kelvin Tan</span>
            <span className="text-[13px] font-medium text-muted">PayNow ••8821</span>
          </span>
          <span className="flex flex-col items-end gap-[3px]">
            <Tag variant="outline" className="py-[4px]">
              New payee
            </Tag>
            <span className="text-[12px] font-semibold">Added 6 min ago</span>
          </span>
        </Link>
        <dl className="m-0 flex flex-col border-t border-line">
          <div className="flex justify-between gap-[12px] border-b border-line py-[12px]">
            <dt className="text-[14px] font-medium text-muted">From</dt>
            <dd className="m-0 flex flex-col gap-[2px] text-right text-[14px] font-semibold">
              Everyday ••4417<span className="text-[13px] font-medium text-muted"><Money sgd={2184.6} /> available</span>
            </dd>
          </div>
          <div className="flex justify-between gap-[12px] border-b border-line py-[12px]">
            <dt className="text-[14px] font-medium text-muted">Reference</dt>
            <dd className="m-0 text-[14px] font-semibold">Investment slot deposit</dd>
          </div>
        </dl>
        <div role="alert" className="flex flex-col gap-[10px] rounded-[16px] border-[2.5px] border-ink bg-sun px-[16px] py-[14px]">
          <div className="flex items-center gap-[10px]">
            <AuntieBao mood="alarm" width={52} height={48} />
            <span className="font-display text-[17px] leading-[1.3] font-semibold">
              Wait wait wait. Auntie wants a word before this goes.
            </span>
          </div>
          <ul className="m-0 flex list-none flex-wrap gap-[6px] p-0">
            <li className="rounded-full bg-white px-[11px] py-[6px] text-[13px] font-semibold">Payee 6 min old</li>
            <li className="rounded-full bg-white px-[11px] py-[6px] text-[13px] font-semibold">15x your median</li>
            <li className="rounded-full bg-white px-[11px] py-[6px] text-[13px] font-semibold">First transfer</li>
          </ul>
        </div>
      </main>
      <div className="flex flex-none flex-col gap-[10px] px-[20px] pt-[12px] pb-[24px]">
        <Button href={ROUTES.PAY_CHECK}>Continue to Auntie&apos;s check</Button>
        <Button variant="secondary" className="px-[6px] py-[1px]">
          Cancel transfer
        </Button>
      </div>
    </Screen>
  );
}
