import Link from "next/link";
import { AuntieBao } from "@/components/mascot";
import { Avatar, Button, Money, Tag } from "@/components/ui";
import { ROUTES } from "@/constants";
import { cn } from "@/utils";
import { AmountField, DEMO_AMOUNT_SGD, DEMO_BALANCE_SGD } from "./AmountPad";
import { FromAccountSelect } from "./FromAccountSelect";

const PAYEES = [
  { initials: "SL", name: "Mum", meta: "34 transfers since 2024" },
  { initials: "JH", name: "Jia Hui Lim", meta: "6 transfers" },
  { initials: "KT", name: "Kelvin Tan", meta: "Added 6 min ago", selected: true },
];

const FIELD = "h-[52px] rounded-[14px] border-[1.5px] border-slate bg-white px-[14px] text-[16px] font-medium";

export function PayDesktop() {
  return (
    <main className="hidden min-h-full min-w-0 flex-1 grid-cols-[minmax(0,1fr)_520px] gap-[40px] bg-white px-[40px] py-[32px] lg:grid">
      <form className="flex flex-col gap-[24px]">
        <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">Send money</h1>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="damt" className="text-[14px] font-semibold">
            Amount
          </label>
          <AmountField id="damt" />
        </div>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="dfrom" className="text-[14px] font-semibold">
            From
          </label>
          <FromAccountSelect id="dfrom" />
        </div>
        <fieldset className="m-0 flex flex-col gap-[8px] border-none p-0">
          <legend className="mb-[8px] p-0 text-[14px] font-semibold">To</legend>
          {PAYEES.map((p) => (
            <label
              key={p.initials}
              className={cn(
                "flex min-h-[60px] cursor-pointer items-center gap-[12px] rounded-[14px] px-[14px] py-[8px]",
                p.selected ? "border-2 border-teal bg-wash" : "border-[1.5px] border-line-strong",
              )}
            >
              <input type="radio" name="dpayee" defaultChecked={p.selected} className="m-0 h-[20px] w-[20px] accent-teal" />
              <Avatar
                initials={p.initials}
                size={40}
                className={p.selected ? "bg-white text-[14px] text-teal" : "bg-mint text-[14px]"}
              />
              <span className="flex flex-1 flex-col">
                <span className="text-[15px] font-semibold">{p.name}</span>
                <span className="text-[13px] font-medium text-muted">{p.meta}</span>
              </span>
              {p.selected && <Tag variant="outline">New</Tag>}
            </label>
          ))}
          <Link href={ROUTES.PAY} className="flex min-h-[44px] items-center text-[14px] font-semibold text-teal">
            Add a payee
          </Link>
        </fieldset>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="dref" className="text-[14px] font-semibold">
            Reference
          </label>
          <input id="dref" type="text" defaultValue="Investment slot deposit" className={FIELD} />
        </div>
      </form>
      <section aria-label="Review" className="flex flex-col gap-[18px] rounded-[24px] bg-wash p-[28px]">
        <h2 className="m-0 font-display text-[20px] font-bold">Review transfer</h2>
        <div className="flex flex-col gap-[4px]">
          <span className="text-[13px] font-medium text-muted">You are sending</span>
          <span className="font-display text-[52px] leading-none font-bold">
            <Money sgd={DEMO_AMOUNT_SGD} />
          </span>
        </div>
        <Link
          href={ROUTES.PAYEE("kelvin-tan")}
          className="flex items-center gap-[12px] rounded-[18px] border border-line-strong bg-white px-[16px] py-[14px] text-night no-underline"
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
        <dl className="m-0 flex flex-col">
          <div className="flex justify-between gap-[12px] border-b border-line-strong py-[10px]">
            <dt className="text-[14px] font-medium text-muted">From</dt>
            <dd className="m-0 text-[14px] font-semibold">
              Everyday ••4417, <Money sgd={DEMO_BALANCE_SGD} />
            </dd>
          </div>
          <div className="flex justify-between gap-[12px] border-b border-line-strong py-[10px]">
            <dt className="text-[14px] font-medium text-muted">Reference</dt>
            <dd className="m-0 text-[14px] font-semibold">Investment slot deposit</dd>
          </div>
        </dl>
        <div role="alert" className="flex flex-col gap-[10px] rounded-[20px] border-[2.5px] border-ink bg-sun p-[16px]">
          <div className="flex items-center gap-[12px]">
            <AuntieBao mood="alarm" width={56} height={52} />
            <span className="font-display text-[18px] leading-[1.3] font-semibold">
              Wait wait wait. Auntie wants a word before this goes.
            </span>
          </div>
          <ul className="m-0 flex list-none flex-wrap gap-[6px] p-0">
            <li className="rounded-full bg-white px-[11px] py-[6px] text-[13px] font-semibold">Payee 6 min old</li>
            <li className="rounded-full bg-white px-[11px] py-[6px] text-[13px] font-semibold">15x your median</li>
            <li className="rounded-full bg-white px-[11px] py-[6px] text-[13px] font-semibold">First transfer</li>
          </ul>
        </div>
        <div className="mt-auto flex gap-[10px]">
          <Link
            href={ROUTES.PAY_CHECK}
            className="flex h-[52px] flex-[1.4] items-center justify-center rounded-[14px] bg-teal text-[16px] font-semibold text-white no-underline"
          >
            Continue to Auntie&apos;s check
          </Link>
          <Button variant="secondary" className="flex-1 px-[6px] py-[1px]">
            Cancel
          </Button>
        </div>
      </section>
    </main>
  );
}
