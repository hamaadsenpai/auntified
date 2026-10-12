import Link from "next/link";
import { BackHeader, Screen } from "@/components/layout";
import { Avatar, Button, Card, Money, Tag } from "@/components/ui";
import { ROUTES } from "@/constants";

export const PAYEE_IDS = ["kelvin-tan"];

const STATS = [
  { term: "First seen", value: "11 Oct, 23:46" },
  { term: "Transfers", value: "0 completed" },
  { term: "Total sent", value: <Money sgd={0} /> },
  { term: "Category", value: "Personal, unverified" },
];

export function PayeeScreen() {
  return (
    <Screen>
      <BackHeader backHref={ROUTES.PAY_REVIEW} title="Payee" />
      <main className="flex min-h-0 flex-1 flex-col gap-[20px] overflow-y-auto px-[20px] pt-[4px] pb-[20px] *:shrink-0">
        <div className="flex items-center gap-[14px]">
          <Avatar initials="KT" size={56} as="div" className="flex-none bg-track text-[19px] text-teal" />
          <div className="flex flex-col gap-[2px]">
            <span className="font-display text-[24px] leading-[1.1] font-bold">Kelvin Tan</span>
            <span className="text-[14px] font-medium text-muted">PayNow ••8821</span>
          </div>
        </div>
        <dl className="m-0 grid grid-cols-[1fr_1fr] gap-[10px]">
          {STATS.map((stat) => (
            <Card key={stat.term} className="flex flex-col gap-[2px] px-[12px] py-[10px]">
              <dt className="text-[12px] font-medium text-muted">{stat.term}</dt>
              <dd className="m-0 font-display text-[16px] font-bold">{stat.value}</dd>
            </Card>
          ))}
          <div className="col-span-full flex items-center justify-between gap-[12px] rounded-[14px] border-[1.5px] border-night px-[12px] py-[10px]">
            <dt className="text-[14px] font-semibold">Flagged before</dt>
            <dd className="m-0 font-display text-[16px] font-bold">Yes, 3 scam reports</dd>
          </div>
        </dl>
        <section className="flex flex-col">
          <h2 className="m-0 mb-[4px] font-display text-[16px] font-bold">Past attempts</h2>
          <Link
            href={ROUTES.PAY_BLOCKED_WHY}
            className="grid min-h-[64px] grid-cols-[1fr_auto] items-center gap-[2px_12px] border-b border-line py-[8px] text-night no-underline"
          >
            <span className="text-[15px] font-semibold"><Money sgd={1850} /></span>
            <Tag variant="blocked">Blocked</Tag>
            <span className="text-[13px] font-medium text-muted">11 Oct 23:52, score 86</span>
          </Link>
          <Link
            href={ROUTES.LEDGER}
            className="grid min-h-[64px] grid-cols-[1fr_auto] items-center gap-[2px_12px] py-[8px] text-night no-underline"
          >
            <span className="text-[15px] font-semibold"><Money sgd={50} /></span>
            <Tag variant="outline">Warned, cancelled</Tag>
            <span className="text-[13px] font-medium text-muted">11 Oct 23:48, score 58</span>
          </Link>
        </section>
      </main>
      <div className="flex flex-none flex-col gap-[10px] px-[20px] pt-[12px] pb-[24px]">
        <Button>Report this payee</Button>
        <Button variant="secondary">Remove payee</Button>
      </div>
    </Screen>
  );
}
